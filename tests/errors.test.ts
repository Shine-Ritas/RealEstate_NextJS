import { describe, expect, it, vi } from "vitest";

import { ApiClient } from "@/lib/api/client";
import {
  ApiError,
  getFieldError,
  getFirstValidationError,
  getSafeErrorMessage,
  isValidationError,
} from "@/lib/api/errors";

describe("ApiClient error normalization", () => {
  it("normalizes Laravel 422 field errors", async () => {
    const client = new ApiClient({
      baseUrl: "https://api.test/v1",
      fetcher: vi.fn(async () =>
        Response.json(
          {
            message: "The given data was invalid.",
            code: "VALIDATION_FAILED",
            errors: { email: ["The email field is required."] },
          },
          { status: 422 },
        ),
      ),
    });

    const error = await client.request("/me").catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(ApiError);
    expect(isValidationError(error)).toBe(true);
    expect(getFieldError(error, "email")).toBe("The email field is required.");
    expect(getFirstValidationError(error)).toBe("The email field is required.");
    expect(getSafeErrorMessage(error)).toBe("The given data was invalid.");
  });

  it("preserves rate-limit retry metadata", async () => {
    const client = new ApiClient({
      baseUrl: "https://api.test/v1",
      fetcher: vi.fn(async () =>
        Response.json(
          { message: "Too many requests.", code: "RATE_LIMITED" },
          { status: 429, headers: { "Retry-After": "45" } },
        ),
      ),
    });

    const error = await client.request("/properties").catch((reason: unknown) => reason);

    expect(error).toMatchObject({ kind: "rate_limit", status: 429, retryAfter: 45 });
  });

  it.each([
    [404, "not_found"],
    [503, "server"],
  ] as const)("preserves HTTP %s as a %s error", async (status, kind) => {
    const client = new ApiClient({
      baseUrl: "https://api.test/v1",
      fetcher: vi.fn(async () =>
        Response.json({ message: "Backend response", code: `HTTP_${status}` }, { status }),
      ),
    });

    const error = await client.request("/resource").catch((reason: unknown) => reason);

    expect(error).toMatchObject({ status, kind, code: `HTTP_${status}` });
  });

  it("normalizes network failures but preserves request cancellation", async () => {
    const networkClient = new ApiClient({
      baseUrl: "https://api.test/v1",
      fetcher: vi.fn(async () => Promise.reject(new TypeError("offline"))),
    });
    const networkError = await networkClient.request("/").catch((reason: unknown) => reason);
    expect(networkError).toMatchObject({ kind: "network", status: 0 });

    const abortClient = new ApiClient({
      baseUrl: "https://api.test/v1",
      fetcher: vi.fn(async () => Promise.reject(new DOMException("Aborted", "AbortError"))),
    });
    const controller = new AbortController();
    controller.abort();

    await expect(abortClient.request("/", { signal: controller.signal })).rejects.toMatchObject({
      name: "AbortError",
    });
  });
});
