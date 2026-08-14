import type { NextRequest } from "next/server";

import {
  assertSameOrigin,
  jsonResponse,
  optionalAuthenticatedServices,
  parseJsonBody,
  runRoute,
} from "@/lib/bff";
import { chatSchema } from "@/schemas";

export function POST(request: NextRequest) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const input = await parseJsonBody(request, chatSchema);
    return jsonResponse(await optionalAuthenticatedServices(request).content.chat(input));
  });
}
