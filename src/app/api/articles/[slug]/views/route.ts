import type { NextRequest } from "next/server";

import { assertSameOrigin, jsonResponse, optionalAuthenticatedServices, runRoute } from "@/lib/bff";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export function POST(request: NextRequest, context: RouteContext) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const { slug } = await context.params;
    return jsonResponse(await optionalAuthenticatedServices(request).articles.recordView(slug));
  });
}
