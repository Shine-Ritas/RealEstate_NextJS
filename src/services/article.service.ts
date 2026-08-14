import { CACHE_TAGS, CACHE_TTL } from "@/config/cache";
import type { ApiClient } from "@/lib/api/client";
import type { JsonResponse, OperationQuery } from "@/lib/api/contract";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { toQueryRecord } from "@/lib/api/query";
import type { ServiceRequestOptions } from "@/types/api";

import { cachedRequestOptions, noStoreRequestOptions } from "./service-helpers";

export function createArticleService(client: ApiClient) {
  return {
    list(params: OperationQuery<"listArticles"> = {}, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"listArticles", 200>>(API_ENDPOINTS.articles.list, {
        ...cachedRequestOptions(options, CACHE_TTL.content, [CACHE_TAGS.articles]),
        query: toQueryRecord(params),
      });
    },

    getBySlug(slug: string, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"getArticle", 200>>(API_ENDPOINTS.articles.detail(slug), {
        ...cachedRequestOptions(options, CACHE_TTL.content, [
          CACHE_TAGS.articles,
          `article:${slug}`,
        ]),
      });
    },

    listTags(options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"listArticleTags", 200>>(
        API_ENDPOINTS.articles.tags,
        cachedRequestOptions(options, CACHE_TTL.reference, [CACHE_TAGS.articles]),
      );
    },

    recordView(slug: string, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"recordArticleView", 200>>(
        API_ENDPOINTS.articles.views(slug),
        {
          ...noStoreRequestOptions(options),
          method: "POST",
          auth: "optional",
        },
      );
    },
  };
}
