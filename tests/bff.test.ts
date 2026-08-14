import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { NextRequest } from "next/server";
import { afterAll, afterEach, beforeAll, describe, expect, it } from "vitest";

import { POST as login } from "@/app/api/auth/login/route";
import { DELETE as logoutCurrentDevice } from "@/app/api/auth/token/route";
import { POST as chat } from "@/app/api/chat/route";
import { GET as session } from "@/app/api/session/route";
import { errorResponse } from "@/lib/bff/response";
import { ApiError } from "@/lib/api/errors";

const API_URL = "https://primeproperty.cfd/api/v1";
const server = setupServer();

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const user = {
  id: 7,
  name: "Prime Client",
  email: "client@example.com",
  avatar_url: null,
  email_verified_at: null,
  created_at: "2026-08-14T00:00:00.000000Z",
};

function loginRequest(origin = "https://app.test") {
  return new NextRequest("https://app.test/api/auth/login", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      host: "app.test",
      origin,
    },
    body: JSON.stringify({
      email: "client@example.com",
      password: "secret-password",
      device_name: "web-chrome",
    }),
  });
}

describe("BFF authentication", () => {
  it("stores the upstream token in an HttpOnly cookie and strips it from JSON", async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json({
          data: {
            user,
            token: {
              access_token: "sanctum-secret",
              token_type: "Bearer",
              expires_at: "2026-09-13T00:00:00.000Z",
              device_name: "web-chrome",
            },
            verification_required: true,
          },
        }),
      ),
    );

    const response = await login(loginRequest());
    const payload = (await response.json()) as Record<string, unknown>;
    const cookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(200);
    expect(JSON.stringify(payload)).not.toContain("sanctum-secret");
    expect(cookie).toContain("primeproperty_session=");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=lax");
    expect(cookie).toContain("Expires=Sun, 13 Sep 2026 00:00:00 GMT");
  });

  it("blocks an unsafe request from a mismatched origin before calling upstream", async () => {
    const response = await login(loginRequest("https://evil.test"));
    const payload = (await response.json()) as { code: string };

    expect(response.status).toBe(403);
    expect(payload.code).toBe("ORIGIN_MISMATCH");
  });

  it("forwards the cookie token to authenticated profile requests", async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json({
          data: {
            user,
            token: {
              access_token: "sanctum-secret",
              token_type: "Bearer",
              expires_at: "2026-09-13T00:00:00.000Z",
              device_name: "web-chrome",
            },
          },
        }),
      ),
      http.get(`${API_URL}/me`, ({ request }) => {
        expect(request.headers.get("authorization")).toBe("Bearer sanctum-secret");
        return HttpResponse.json({ data: user });
      }),
    );
    const authResponse = await login(loginRequest());
    const setCookie = authResponse.headers.get("set-cookie") ?? "";
    const cookie = setCookie.split(";", 1)[0] ?? "";
    const request = new NextRequest("https://app.test/api/session", {
      headers: { cookie, host: "app.test" },
    });

    const response = await session(request);
    const body = (await response.json()) as { data: { device_name: string } };

    expect(response.status).toBe(200);
    expect(body.data.device_name).toBe("web-chrome");
  });

  it("forwards logout to Laravel and clears the current-device cookie", async () => {
    server.use(
      http.post(`${API_URL}/auth/login`, () =>
        HttpResponse.json({
          data: {
            user,
            token: {
              access_token: "sanctum-secret",
              token_type: "Bearer",
              expires_at: "2026-09-13T00:00:00.000Z",
              device_name: "web-chrome",
            },
          },
        }),
      ),
      http.delete(`${API_URL}/auth/token`, ({ request }) => {
        expect(request.headers.get("authorization")).toBe("Bearer sanctum-secret");
        return HttpResponse.json({ message: "Logged out." });
      }),
    );
    const authResponse = await login(loginRequest());
    const cookie = (authResponse.headers.get("set-cookie") ?? "").split(";", 1)[0] ?? "";
    const request = new NextRequest("https://app.test/api/auth/token", {
      method: "DELETE",
      headers: { cookie, host: "app.test", origin: "https://app.test" },
    });

    const response = await logoutCurrentDevice(request);

    expect(response.status).toBe(200);
    expect(response.headers.get("set-cookie")).toContain("Max-Age=0");
  });

  it("preserves chat 503 responses through the BFF", async () => {
    server.use(
      http.post(`${API_URL}/chat`, () =>
        HttpResponse.json(
          { message: "Chat is temporarily unavailable.", code: "CHAT_UNAVAILABLE" },
          { status: 503 },
        ),
      ),
    );
    const request = new NextRequest("https://app.test/api/chat", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        host: "app.test",
        origin: "https://app.test",
      },
      body: JSON.stringify({ message: "Find condos near transit" }),
    });

    const response = await chat(request);
    const body = (await response.json()) as { code: string };

    expect(response.status).toBe(503);
    expect(body.code).toBe("CHAT_UNAVAILABLE");
  });

  it("clears the session cookie on authenticated 401 responses", async () => {
    const request = new NextRequest("https://app.test/api/me");
    const response = errorResponse(
      new ApiError("Unauthenticated.", { status: 401, kind: "authentication" }),
      request,
    );
    const cookie = response.headers.get("set-cookie") ?? "";

    expect(response.status).toBe(401);
    expect(cookie).toContain("primeproperty_session=");
    expect(cookie).toContain("Max-Age=0");
  });
});
