import type { NextRequest } from "next/server";

import { jsonResponse, publicServices, runRoute } from "@/lib/bff";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export function GET(request: NextRequest, context: RouteContext) {
  return runRoute(request, async () => {
    const { slug } = await context.params;
    return jsonResponse(await publicServices().articles.getBySlug(slug));
  });
}
