import { CACHE_TAGS, CACHE_TTL } from "@/config/cache";
import type { ApiClient } from "@/lib/api/client";
import type { JsonRequest, JsonResponse, OperationQuery } from "@/lib/api/contract";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { toQueryRecord } from "@/lib/api/query";
import type { ServiceRequestOptions } from "@/types/api";

import { cachedRequestOptions, noStoreRequestOptions } from "./service-helpers";

export function createContentService(client: ApiClient) {
  const legalOptions = (options?: ServiceRequestOptions) =>
    cachedRequestOptions(options, CACHE_TTL.reference, [CACHE_TAGS.legal]);

  return {
    getPrivacyPolicy(options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"getPrivacyPolicy", 200>>(
        API_ENDPOINTS.legal.privacy,
        legalOptions(options),
      );
    },

    getTerms(options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"getTerms", 200>>(
        API_ENDPOINTS.legal.terms,
        legalOptions(options),
      );
    },

    listLanguages(options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"listLanguages", 200>>(
        API_ENDPOINTS.languages.list,
        cachedRequestOptions(options, CACHE_TTL.reference, [CACHE_TAGS.languages]),
      );
    },

    getLanguage(
      locale: "en" | "my" | "th" | "zh",
      params: OperationQuery<"getLanguage"> = {},
      options?: ServiceRequestOptions,
    ) {
      return client.request<JsonResponse<"getLanguage", 200>>(
        API_ENDPOINTS.languages.detail(locale),
        {
          ...cachedRequestOptions(options, CACHE_TTL.reference, [CACHE_TAGS.languages]),
          query: toQueryRecord(params),
        },
      );
    },

    chat(input: JsonRequest<"chat">, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"chat", 200>>(API_ENDPOINTS.chat, {
        ...noStoreRequestOptions(options),
        method: "POST",
        body: input,
        auth: "optional",
      });
    },
  };
}
