import type { NextRequest } from "next/server";

import { readSessionCookie } from "@/lib/auth/session-cookie";
import { ApiError } from "@/lib/api/errors";
import { createAuthenticatedApiClient, createPublicApiClient } from "@/lib/api/server-client";
import { createApiServices } from "@/services";

export function publicServices() {
  return createApiServices(createPublicApiClient());
}

export function optionalAuthenticatedServices(request: NextRequest) {
  const session = readSessionCookie(request);
  return createApiServices(
    session ? createAuthenticatedApiClient(session.access_token) : createPublicApiClient(),
  );
}

export function authenticatedServices(request: NextRequest) {
  const session = readSessionCookie(request);
  if (!session) {
    throw new ApiError("Authentication is required.", {
      status: 401,
      kind: "authentication",
      code: "UNAUTHENTICATED",
    });
  }

  return {
    session,
    services: createApiServices(createAuthenticatedApiClient(session.access_token)),
  };
}
