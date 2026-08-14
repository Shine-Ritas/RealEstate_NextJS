import type { ApiClient } from "@/lib/api/client";
import type { JsonRequest, JsonResponse } from "@/lib/api/contract";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ServiceRequestOptions } from "@/types/api";

import { noStoreRequestOptions } from "./service-helpers";

export function createProfileService(client: ApiClient) {
  return {
    get(options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"getProfile", 200>>(API_ENDPOINTS.profile.me, {
        ...noStoreRequestOptions(options),
        auth: "required",
      });
    },

    update(input: JsonRequest<"updateProfile">, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"updateProfile", 200>>(API_ENDPOINTS.profile.me, {
        ...noStoreRequestOptions(options),
        method: "PATCH",
        body: input,
        auth: "required",
      });
    },

    uploadAvatar(avatar: Blob, fileName = "avatar", options?: ServiceRequestOptions) {
      const formData = new FormData();
      formData.set("avatar", avatar, fileName);
      return client.request<JsonResponse<"uploadAvatar", 200>>(API_ENDPOINTS.profile.avatar, {
        ...noStoreRequestOptions(options),
        method: "POST",
        body: formData,
        auth: "required",
      });
    },

    deleteAvatar(options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"deleteAvatar", 200>>(API_ENDPOINTS.profile.avatar, {
        ...noStoreRequestOptions(options),
        method: "DELETE",
        auth: "required",
      });
    },
  };
}
