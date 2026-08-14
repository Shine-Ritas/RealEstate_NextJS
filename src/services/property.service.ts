import { CACHE_TAGS, CACHE_TTL } from "@/config/cache";
import type { ApiClient } from "@/lib/api/client";
import type { JsonResponse, OperationQuery } from "@/lib/api/contract";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { toQueryRecord, type QueryRecord } from "@/lib/api/query";
import type { ServiceRequestOptions } from "@/types/api";
import type { EnquiryInput, PropertyMapParams, PropertySearchParams } from "@/types/property";

import { cachedRequestOptions, noStoreRequestOptions } from "./service-helpers";

function propertyQuery(params: PropertySearchParams | PropertyMapParams): QueryRecord {
  const { facility_ids, ...rest } = params;
  const query = toQueryRecord(rest);
  if (facility_ids?.length) query["facility_ids[]"] = facility_ids;
  return query;
}

export function createPropertyService(client: ApiClient) {
  return {
    list(params: PropertySearchParams = {}, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"listProperties", 200>>(API_ENDPOINTS.properties.list, {
        ...cachedRequestOptions(options, CACHE_TTL.property, [CACHE_TAGS.properties]),
        query: propertyQuery(params),
        auth: "optional",
      });
    },

    getOptions(params: OperationQuery<"getPropertyOptions"> = {}, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"getPropertyOptions", 200>>(
        API_ENDPOINTS.properties.options,
        {
          ...cachedRequestOptions(options, CACHE_TTL.reference, [CACHE_TAGS.propertyOptions]),
          query: toQueryRecord(params),
          auth: "optional",
        },
      );
    },

    getMap(params: PropertyMapParams = {}, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"getPropertyMap", 200>>(API_ENDPOINTS.properties.map, {
        ...cachedRequestOptions(options, CACHE_TTL.property, [CACHE_TAGS.properties]),
        query: propertyQuery(params),
        auth: "optional",
      });
    },

    getBySlug(
      slug: string,
      params: OperationQuery<"getProperty"> = {},
      options?: ServiceRequestOptions,
    ) {
      return client.request<JsonResponse<"getProperty", 200>>(
        API_ENDPOINTS.properties.detail(slug),
        {
          ...cachedRequestOptions(options, CACHE_TTL.property, [
            CACHE_TAGS.properties,
            `property:${slug}`,
          ]),
          query: toQueryRecord(params),
          auth: "optional",
        },
      );
    },

    recordView(slug: string, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"recordPropertyView", 200>>(
        API_ENDPOINTS.properties.views(slug),
        {
          ...noStoreRequestOptions(options),
          method: "POST",
          auth: "optional",
        },
      );
    },

    createEnquiry(slug: string, input: EnquiryInput, options?: ServiceRequestOptions) {
      return client.request<JsonResponse<"createPropertyEnquiry", 201>>(
        API_ENDPOINTS.properties.enquiries(slug),
        {
          ...noStoreRequestOptions(options),
          method: "POST",
          body: input,
          auth: "optional",
        },
      );
    },
  };
}
