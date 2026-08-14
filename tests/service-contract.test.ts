import { readFile } from "node:fs/promises";

import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { ApiClient } from "@/lib/api/client";
import { createApiServices, IMPLEMENTED_OPERATION_IDS } from "@/services";

const API_URL = "https://api.test/v1";
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("OpenAPI service coverage", () => {
  it("has one wrapper for every documented operation", async () => {
    const source = await readFile(new URL("../docs/api/openapi.json", import.meta.url), "utf8");
    const document = JSON.parse(source) as {
      paths: Record<string, Record<string, { operationId?: string }>>;
    };
    const contractOperations = Object.values(document.paths)
      .flatMap((path) => Object.values(path))
      .flatMap((operation) => (operation.operationId ? [operation.operationId] : []))
      .sort();

    expect([...IMPLEMENTED_OPERATION_IDS].sort()).toEqual(contractOperations);
    expect(contractOperations).toHaveLength(40);
  });
});

describe("service wire contracts", () => {
  it("uses repeated facility filters, optional auth, and Laravel pagination", async () => {
    server.use(
      http.get(`${API_URL}/properties`, ({ request }) => {
        expect(request.headers.get("authorization")).toBe("Bearer test-token");
        const url = new URL(request.url);
        expect(url.searchParams.getAll("facility_ids[]")).toEqual(["4", "9"]);
        expect(url.searchParams.get("quick_pet_friendly")).toBe("false");

        return HttpResponse.json({
          data: [],
          meta: {
            current_page: 1,
            from: null,
            last_page: 1,
            path: `${API_URL}/properties`,
            per_page: 12,
            to: null,
            total: 0,
          },
          links: {
            first: `${API_URL}/properties?page=1`,
            last: `${API_URL}/properties?page=1`,
            prev: null,
            next: null,
          },
        });
      }),
    );
    const services = createApiServices(new ApiClient({ baseUrl: API_URL, token: "test-token" }));

    const result = await services.properties.list({
      facility_ids: [4, 9],
      quick_pet_friendly: false,
    });

    expect(result.data).toEqual([]);
    expect(result.meta.total).toBe(0);
  });

  it("forwards multipart avatar uploads without forcing a content type", async () => {
    server.use(
      http.post(`${API_URL}/me/avatar`, async ({ request }) => {
        expect(request.headers.get("authorization")).toBe("Bearer test-token");
        expect(request.headers.get("content-type")).toContain("multipart/form-data; boundary=");
        const form = await request.formData();
        expect(form.get("avatar")).toBeInstanceOf(File);
        return HttpResponse.json({ data: { avatar_url: "https://cdn.test/avatar.png" } });
      }),
    );
    const services = createApiServices(new ApiClient({ baseUrl: API_URL, token: "test-token" }));
    const avatar = new File(["image"], "avatar.png", { type: "image/png" });

    const result = await services.profile.uploadAvatar(avatar);

    expect(result.data.avatar_url).toBe("https://cdn.test/avatar.png");
  });

  it("uses idempotent PUT and DELETE favorite endpoints", async () => {
    let calls = 0;
    server.use(
      http.put(`${API_URL}/favorites/:property`, ({ request }) => {
        expect(request.headers.get("authorization")).toBe("Bearer test-token");
        calls += 1;
        return HttpResponse.json({ data: { is_favorited: true } });
      }),
      http.delete(`${API_URL}/favorites/:property`, () => {
        calls += 1;
        return HttpResponse.json({ data: { is_favorited: false } });
      }),
    );
    const services = createApiServices(new ApiClient({ baseUrl: API_URL, token: "test-token" }));

    await services.favorites.add("01JPROPERTYULID00000000000");
    await services.favorites.remove("01JPROPERTYULID00000000000");

    expect(calls).toBe(2);
  });

  it("fails locally when a required-auth operation has no token", async () => {
    const services = createApiServices(new ApiClient({ baseUrl: API_URL }));

    await expect(services.profile.get()).rejects.toMatchObject({
      kind: "authentication",
      code: "MISSING_AUTH_TOKEN",
    });
  });
});
