import type { NextRequest } from "next/server";

import {
  assertSameOrigin,
  authenticatedServices,
  jsonResponse,
  parseJsonBody,
  runRoute,
} from "@/lib/bff";
import { newsletterSchema } from "@/schemas";

export function GET(request: NextRequest) {
  return runRoute(request, async () => {
    const { services } = authenticatedServices(request);
    return jsonResponse(await services.newsletter.get());
  });
}

export function PUT(request: NextRequest) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, newsletterSchema);
    const { services } = authenticatedServices(request);
    return jsonResponse(await services.newsletter.update(input));
  });
}

export function DELETE(request: NextRequest) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const { services } = authenticatedServices(request);
    return jsonResponse(await services.newsletter.remove());
  });
}
