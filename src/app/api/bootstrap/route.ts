import type { NextRequest } from "next/server";

import { jsonResponse, optionalAuthenticatedServices, runRoute } from "@/lib/bff";

export function GET(request: NextRequest) {
  return runRoute(request, async () => {
    const locale = request.nextUrl.searchParams.get("locale");
    const layout = request.nextUrl.searchParams.get("layout");
    return jsonResponse(
      await optionalAuthenticatedServices(request).service.getBootstrap(
        {
          ...(locale === null ? {} : { locale: locale as "en" | "my" | "th" | "zh" }),
          ...(layout === null ? {} : { layout: layout as "guest" | "guest_v2" }),
        },
        { cache: "no-store" },
      ),
    );
  });
}
