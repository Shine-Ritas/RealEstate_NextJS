import type { NextRequest } from "next/server";

import { assertSameOrigin, authenticatedServices, jsonResponse, runRoute } from "@/lib/bff";

export function POST(request: NextRequest) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const { services } = authenticatedServices(request);
    return jsonResponse(await services.auth.resendVerification(), 202);
  });
}
