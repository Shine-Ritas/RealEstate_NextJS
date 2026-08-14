import "server-only";

import { getServerEnv } from "@/config/env";

import { ApiClient } from "./client";

export function createPublicApiClient(): ApiClient {
  return new ApiClient({ baseUrl: getServerEnv().PRIMEPROPERTY_API_URL });
}

export function createAuthenticatedApiClient(
  token: string,
  onUnauthorized?: () => void | Promise<void>,
): ApiClient {
  return new ApiClient({
    baseUrl: getServerEnv().PRIMEPROPERTY_API_URL,
    token,
    ...(onUnauthorized === undefined ? {} : { onUnauthorized }),
  });
}
