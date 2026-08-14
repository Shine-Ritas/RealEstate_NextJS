import type { NextRequest } from "next/server";

import {
  assertSameOrigin,
  authenticatedServices,
  jsonResponse,
  parseJsonBody,
  runRoute,
} from "@/lib/bff";
import { verifyEmailSchema } from "@/schemas";

export function POST(request: NextRequest) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, verifyEmailSchema);
    const { services } = authenticatedServices(request);
    return jsonResponse(await services.auth.verifyEmail(input));
  });
}
