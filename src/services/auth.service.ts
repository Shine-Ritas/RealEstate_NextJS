import type { ApiClient } from "@/lib/api/client";
import type { JsonRequest, JsonResponse } from "@/lib/api/contract";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import type { ServiceRequestOptions } from "@/types/api";

import { noStoreRequestOptions } from "./service-helpers";

export function createAuthService(client: ApiClient) {
  return {
    register(input: JsonRequest<"register">, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"register", 201>>(API_ENDPOINTS.auth.register, {
        ...noStoreRequestOptions(options),
        method: "POST",
        body: input,
      });
    },

    login(input: JsonRequest<"login">, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"login", 200>>(API_ENDPOINTS.auth.login, {
        ...noStoreRequestOptions(options),
        method: "POST",
        body: input,
      });
    },

    googleLogin(input: JsonRequest<"googleLogin">, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"googleLogin", 200>>(API_ENDPOINTS.auth.google, {
        ...noStoreRequestOptions(options),
        method: "POST",
        body: input,
      });
    },

    forgotPassword(input: JsonRequest<"forgotPassword">, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"forgotPassword", 202>>(
        API_ENDPOINTS.auth.forgotPassword,
        {
          ...noStoreRequestOptions(options),
          method: "POST",
          body: input,
        },
      );
    },

    resetPassword(input: JsonRequest<"resetPassword">, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"resetPassword", 200>>(API_ENDPOINTS.auth.resetPassword, {
        ...noStoreRequestOptions(options),
        method: "POST",
        body: input,
      });
    },

    verifyEmail(input: JsonRequest<"verifyEmail">, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"verifyEmail", 200>>(API_ENDPOINTS.auth.verifyEmail, {
        ...noStoreRequestOptions(options),
        method: "POST",
        body: input,
        auth: "required",
      });
    },

    resendVerification(options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"resendVerification", 202>>(
        API_ENDPOINTS.auth.resendVerification,
        {
          ...noStoreRequestOptions(options),
          method: "POST",
          auth: "required",
        },
      );
    },

    logoutCurrentDevice(options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"logoutCurrentDevice", 200>>(API_ENDPOINTS.auth.token, {
        ...noStoreRequestOptions(options),
        method: "DELETE",
        auth: "required",
      });
    },

    logoutAllDevices(options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"logoutAllDevices", 200>>(API_ENDPOINTS.auth.tokens, {
        ...noStoreRequestOptions(options),
        method: "DELETE",
        auth: "required",
      });
    },
  };
}
