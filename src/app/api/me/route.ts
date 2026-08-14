import type { NextRequest } from "next/server";

import {
  assertSameOrigin,
  authenticatedServices,
  jsonResponse,
  parseJsonBody,
  runRoute,
} from "@/lib/bff";
import { updateProfileSchema } from "@/schemas";

export function GET(request: NextRequest) {
  return runRoute(request, async () => {
    const { services } = authenticatedServices(request);
    return jsonResponse(await services.profile.get());
  });
}

export function PATCH(request: NextRequest) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, updateProfileSchema);
    const { services } = authenticatedServices(request);
    return jsonResponse(await services.profile.update(input));
  });
}
