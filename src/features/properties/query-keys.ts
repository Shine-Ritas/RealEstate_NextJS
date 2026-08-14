import type { PropertyMapParams, PropertySearchParams } from "@/types/property";

export const propertyQueryKeys = {
  all: ["properties"] as const,
  list: (params: PropertySearchParams) => [...propertyQueryKeys.all, "list", params] as const,
  map: (params: PropertyMapParams) => [...propertyQueryKeys.all, "map", params] as const,
  detail: (slug: string, locale?: string) =>
    [...propertyQueryKeys.all, "detail", slug, locale] as const,
};
