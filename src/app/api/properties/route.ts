import type { NextRequest } from "next/server";

import {
  jsonResponse,
  optionalAuthenticatedServices,
  parsePropertySearchParams,
  runRoute,
} from "@/lib/bff";

export function GET(request: NextRequest) {
  return runRoute(request, async () =>
    jsonResponse(
      await optionalAuthenticatedServices(request).properties.list(
        parsePropertySearchParams(request.nextUrl.searchParams),
        { cache: "no-store" },
      ),
    ),
  );
}
