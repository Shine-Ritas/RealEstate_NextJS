import type { NextRequest } from "next/server";

import { clearSessionCookie } from "@/lib/auth/session-cookie";
import { assertSameOrigin, authenticatedServices, jsonResponse, runRoute } from "@/lib/bff";

export function DELETE(request: NextRequest) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const { services } = authenticatedServices(request);
    const response = jsonResponse(await services.auth.logoutAllDevices());
    clearSessionCookie(response);
    return response;
  });
}
