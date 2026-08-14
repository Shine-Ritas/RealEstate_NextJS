import type { NextRequest } from "next/server";

import { jsonResponse, publicServices, runRoute } from "@/lib/bff";

export function GET(request: NextRequest) {
  return runRoute(request, async () =>
    jsonResponse(await publicServices().service.discover({ cache: "force-cache" })),
  );
}
