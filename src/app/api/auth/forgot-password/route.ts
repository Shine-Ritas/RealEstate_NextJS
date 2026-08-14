import type { NextRequest } from "next/server";

import { assertSameOrigin, jsonResponse, parseJsonBody, publicServices, runRoute } from "@/lib/bff";
import { forgotPasswordSchema } from "@/schemas";

export function POST(request: NextRequest) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, forgotPasswordSchema);
    return jsonResponse(await publicServices().auth.forgotPassword(input), 202);
  });
}
