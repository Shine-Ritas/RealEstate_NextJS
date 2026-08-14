import type { ApiClient } from "@/lib/api/client";
import type { JsonRequest, JsonResponse } from "@/lib/api/contract";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ServiceRequestOptions } from "@/types/api";

import { noStoreRequestOptions } from "./service-helpers";

export function createNewsletterService(client: ApiClient) {
  return {
    get(options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"getNewsletterSubscription", 200>>(
        API_ENDPOINTS.newsletter,
        {
          ...noStoreRequestOptions(options),
          auth: "required",
        },
      );
    },

    update(input: JsonRequest<"updateNewsletterSubscription">, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"updateNewsletterSubscription", 200>>(
        API_ENDPOINTS.newsletter,
        {
          ...noStoreRequestOptions(options),
          method: "PUT",
          body: input,
          auth: "required",
        },
      );
    },

    remove(options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"deleteNewsletterSubscription", 200>>(
        API_ENDPOINTS.newsletter,
        {
          ...noStoreRequestOptions(options),
          method: "DELETE",
          auth: "required",
        },
      );
    },
  };
}
