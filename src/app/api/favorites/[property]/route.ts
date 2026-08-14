import type { NextRequest } from "next/server";

import { assertSameOrigin, authenticatedServices, jsonResponse, runRoute } from "@/lib/bff";

interface RouteContext {
  params: Promise<{ property: string }>;
}

export function PUT(request: NextRequest, context: RouteContext) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const { property } = await context.params;
    const { services } = authenticatedServices(request);
    return jsonResponse(await services.favorites.add(property));
  });
}

export function DELETE(request: NextRequest, context: RouteContext) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const { property } = await context.params;
    const { services } = authenticatedServices(request);
    return jsonResponse(await services.favorites.remove(property));
  });
}
