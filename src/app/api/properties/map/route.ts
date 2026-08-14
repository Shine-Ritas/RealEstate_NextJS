import type { NextRequest } from "next/server";

import {
  jsonResponse,
  optionalAuthenticatedServices,
  parsePropertyMapParams,
  runRoute,
} from "@/lib/bff";

export function GET(request: NextRequest) {
  return runRoute(request, async () =>
    jsonResponse(
      await optionalAuthenticatedServices(request).properties.getMap(
        parsePropertyMapParams(request.nextUrl.searchParams),
        { cache: "no-store" },
      ),
    ),
  );
}
