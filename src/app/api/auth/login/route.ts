import type { NextRequest } from "next/server";

import {
  assertSameOrigin,
  authSessionResponse,
  parseJsonBody,
  publicServices,
  runRoute,
} from "@/lib/bff";
import { loginSchema } from "@/schemas";

export function POST(request: NextRequest) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, loginSchema);
    return authSessionResponse(await publicServices().auth.login(input));
  });
}
