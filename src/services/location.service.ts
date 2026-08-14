import { CACHE_TAGS, CACHE_TTL } from "@/config/cache";
import type { ApiClient } from "@/lib/api/client";
import type { JsonResponse } from "@/lib/api/contract";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ServiceRequestOptions } from "@/types/api";

import { cachedRequestOptions } from "./service-helpers";

export function createLocationService(client: ApiClient) {
  const cached = (options?: ServiceRequestOptions) =>
    cachedRequestOptions(options, CACHE_TTL.reference, [CACHE_TAGS.locations]);

  return {
    listProvinces(options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"listProvinces", 200>>(
        API_ENDPOINTS.locations.provinces,
        cached(options),
      );
    },

    listDistricts(provinceCode: string, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"listDistricts", 200>>(
        API_ENDPOINTS.locations.districts(provinceCode),
        cached(options),
      );
    },

    listSubdistricts(districtCode: string, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"listSubdistricts", 200>>(
        API_ENDPOINTS.locations.subdistricts(districtCode),
        cached(options),
      );
    },
  };
}
