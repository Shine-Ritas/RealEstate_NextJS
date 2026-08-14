import { parseWithSchema } from "@/lib/bff/request";
import { propertyMapParamsSchema, propertySearchParamsSchema } from "@/schemas";
import type { PropertyMapParams, PropertySearchParams } from "@/types/property";

const NUMBER_FIELDS = [
  "min_price",
  "max_price",
  "min_bedrooms",
  "min_bathrooms",
  "page",
  "per_page",
  "north",
  "south",
  "east",
  "west",
] as const;

const BOOLEAN_FIELDS = [
  "quick_all_residential",
  "quick_near_school",
  "quick_budget",
  "quick_condominium",
  "quick_sustainable_living",
  "quick_pet_friendly",
] as const;

const STRING_FIELDS = [
  "locale",
  "q",
  "listing_type",
  "property_type",
  "project_status",
  "p_code",
  "d_code",
  "s_code",
  "sort",
] as const;

function parseBoolean(value: string): boolean | string {
  if (value === "true" || value === "1") return true;
  if (value === "false" || value === "0") return false;
  return value;
}

function rawPropertyParams(searchParams: URLSearchParams): Record<string, unknown> {
  const raw: Record<string, unknown> = {};

  for (const field of STRING_FIELDS) {
    const value = searchParams.get(field);
    if (value !== null && value !== "") raw[field] = value;
  }
  for (const field of NUMBER_FIELDS) {
    const value = searchParams.get(field);
    if (value !== null && value !== "") raw[field] = Number(value);
  }
  for (const field of BOOLEAN_FIELDS) {
    const value = searchParams.get(field);
    if (value !== null && value !== "") raw[field] = parseBoolean(value);
  }

  const facilities = searchParams.getAll("facility_ids[]");
  if (facilities.length) raw.facility_ids = facilities.map(Number);
  return raw;
}

export function parsePropertySearchParams(searchParams: URLSearchParams): PropertySearchParams {
  const raw = rawPropertyParams(searchParams);
  delete raw.north;
  delete raw.south;
  delete raw.east;
  delete raw.west;
  return parseWithSchema(raw, propertySearchParamsSchema);
}

export function parsePropertyMapParams(searchParams: URLSearchParams): PropertyMapParams {
  const raw = rawPropertyParams(searchParams);
  delete raw.page;
  delete raw.per_page;
  return parseWithSchema(raw, propertyMapParamsSchema);
}
