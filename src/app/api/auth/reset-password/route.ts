import type { NextRequest } from "next/server";

import { assertSameOrigin, jsonResponse, parseJsonBody, publicServices, runRoute } from "@/lib/bff";
import { resetPasswordSchema } from "@/schemas";

export function POST(request: NextRequest) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, resetPasswordSchema);
    return jsonResponse(await publicServices().auth.resetPassword(input));
  });
}
