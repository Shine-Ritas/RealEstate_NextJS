import type { NextRequest } from "next/server";

import {
  assertSameOrigin,
  jsonResponse,
  optionalAuthenticatedServices,
  parseJsonBody,
  runRoute,
} from "@/lib/bff";
import { enquirySchema } from "@/schemas";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export function POST(request: NextRequest, context: RouteContext) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const { slug } = await context.params;
    const input = await parseJsonBody(request, enquirySchema);
    return jsonResponse(
      await optionalAuthenticatedServices(request).properties.createEnquiry(slug, input),
      201,
    );
  });
}
