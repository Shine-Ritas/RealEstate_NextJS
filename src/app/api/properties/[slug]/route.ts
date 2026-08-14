import type { NextRequest } from "next/server";

import { jsonResponse, optionalAuthenticatedServices, runRoute } from "@/lib/bff";

interface RouteContext {
  params: Promise<{ slug: string }>;
}

export function GET(request: NextRequest, context: RouteContext) {
  return runRoute(request, async () => {
    const { slug } = await context.params;
    const locale = request.nextUrl.searchParams.get("locale");
    return jsonResponse(
      await optionalAuthenticatedServices(request).properties.getBySlug(
        slug,
        locale === null ? {} : { locale: locale as "en" | "my" | "th" | "zh" },
        { cache: "no-store" },
      ),
    );
  });
}
