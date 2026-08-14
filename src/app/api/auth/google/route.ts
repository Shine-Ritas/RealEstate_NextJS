import type { NextRequest } from "next/server";

import {
  assertSameOrigin,
  authSessionResponse,
  parseJsonBody,
  publicServices,
  runRoute,
} from "@/lib/bff";
import { googleLoginSchema } from "@/schemas";

export function POST(request: NextRequest) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, googleLoginSchema);
    return authSessionResponse(await publicServices().auth.googleLogin(input));
  });
}
