import type { ApiRequestOptions } from "@/lib/api/client";
import type { ServiceRequestOptions } from "@/types/api";

export function cachedRequestOptions(
  options: ServiceRequestOptions | undefined,
  defaultRevalidate: number,
  defaultTags: string[],
): ApiRequestOptions {
  const cache = options?.cache ?? "force-cache";
  const request: ApiRequestOptions = { cache };
  if (options?.signal !== undefined) request.signal = options.signal;

  if (cache !== "no-store") {
    request.next = {
      revalidate: options?.revalidate ?? defaultRevalidate,
      tags: options?.tags ?? defaultTags,
    };
  }

  return request;
}

export function noStoreRequestOptions(options?: ServiceRequestOptions): ApiRequestOptions {
  const request: ApiRequestOptions = { cache: "no-store" };
  if (options?.signal !== undefined) request.signal = options.signal;
  return request;
}
