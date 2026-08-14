import type { ApiClient } from "@/lib/api/client";
import type { JsonResponse, OperationQuery } from "@/lib/api/contract";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { toQueryRecord } from "@/lib/api/query";
import type { ServiceRequestOptions } from "@/types/api";

import { noStoreRequestOptions } from "./service-helpers";

export function createFavoriteService(client: ApiClient) {
  return {
    list(params: OperationQuery<"listFavorites"> = {}, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"listFavorites", 200>>(API_ENDPOINTS.favorites.list, {
        ...noStoreRequestOptions(options),
        query: toQueryRecord(params),
        auth: "required",
      });
    },

    add(propertyId: string, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"addFavorite", 200>>(
        API_ENDPOINTS.favorites.property(propertyId),
        {
          ...noStoreRequestOptions(options),
          method: "PUT",
          auth: "required",
        },
      );
    },

    remove(propertyId: string, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"removeFavorite", 200>>(
        API_ENDPOINTS.favorites.property(propertyId),
        {
          ...noStoreRequestOptions(options),
          method: "DELETE",
          auth: "required",
        },
      );
    },
  };
}
