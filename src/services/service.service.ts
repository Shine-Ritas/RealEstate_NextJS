import { CACHE_TAGS, CACHE_TTL } from "@/config/cache";
import type { ApiClient } from "@/lib/api/client";
import type { JsonResponse, OperationQuery } from "@/lib/api/contract";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { toQueryRecord } from "@/lib/api/query";
import type { ServiceRequestOptions } from "@/types/api";

import { cachedRequestOptions } from "./service-helpers";

export function createServiceService(client: ApiClient) {
  return {
    discover(options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"serviceIndex", 200>>(
        API_ENDPOINTS.service,
        cachedRequestOptions(options, CACHE_TTL.reference, ["service"]),
      );
    },

    getBootstrap(params: OperationQuery<"getBootstrap"> = {}, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"getBootstrap", 200>>(API_ENDPOINTS.bootstrap, {
        ...cachedRequestOptions(options, CACHE_TTL.reference, [CACHE_TAGS.bootstrap]),
        query: toQueryRecord(params),
        auth: "optional",
      });
    },

    getHome(params: OperationQuery<"getHome"> = {}, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"getHome", 200>>(API_ENDPOINTS.home, {
        ...cachedRequestOptions(options, CACHE_TTL.content, [CACHE_TAGS.home]),
        query: toQueryRecord(params),
        auth: "optional",
      });
    },
  };
}
