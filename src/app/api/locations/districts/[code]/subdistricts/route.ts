import type { NextRequest } from "next/server";

import { jsonResponse, publicServices, runRoute } from "@/lib/bff";

interface RouteContext {
  params: Promise<{ code: string }>;
}

export function GET(request: NextRequest, context: RouteContext) {
  return runRoute(request, async () => {
    const { code } = await context.params;
    return jsonResponse(await publicServices().locations.listSubdistricts(code));
  });
}
