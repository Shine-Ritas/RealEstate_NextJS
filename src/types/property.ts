import type { ApiSchema, JsonRequest, JsonResponse, OperationQuery } from "@/lib/api/contract";

type ContractPropertySearchParams = OperationQuery<"listProperties">;
type ContractPropertyMapParams = OperationQuery<"getPropertyMap">;

export type PropertySearchParams = Omit<ContractPropertySearchParams, "facility_ids[]"> & {
  facility_ids?: number[];
};

export type PropertyMapParams = Omit<ContractPropertyMapParams, "facility_ids[]"> & {
  facility_ids?: number[];
};

export type PropertySummary = ApiSchema<"PropertySummary">;
export type PropertyDetail = ApiSchema<"PropertyDetail">;
export type PropertyMarker = ApiSchema<"PropertyMarker">;
export type PropertyPage = ApiSchema<"PropertyPage">;
export type PropertyOptionsResponse = JsonResponse<"getPropertyOptions", 200>;
export type PropertyMapResponse = JsonResponse<"getPropertyMap", 200>;
export type PropertyDetailResponse = JsonResponse<"getProperty", 200>;
export type EnquiryInput = JsonRequest<"createPropertyEnquiry">;
export type EnquiryResponse = JsonResponse<"createPropertyEnquiry", 201>;
export type ViewResultResponse = ApiSchema<"ViewResultEnvelope">;
