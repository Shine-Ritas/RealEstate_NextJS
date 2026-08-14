export type QueryPrimitive = string | number | boolean;
export type QueryValue = QueryPrimitive | readonly QueryPrimitive[] | null | undefined;
export type QueryRecord = Record<string, QueryValue>;

export function buildQueryString(params?: QueryRecord): string {
  if (!params) return "";

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        searchParams.append(key, String(item));
      }
      continue;
    }

    searchParams.append(key, String(value));
  }

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export function toQueryRecord(input: object): QueryRecord {
  const query: QueryRecord = {};

  for (const [key, value] of Object.entries(input)) {
    if (
      value === undefined ||
      value === null ||
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      (Array.isArray(value) &&
        value.every(
          (item) =>
            typeof item === "string" || typeof item === "number" || typeof item === "boolean",
        ))
    ) {
      query[key] = value as QueryValue;
    }
  }

  return query;
}
