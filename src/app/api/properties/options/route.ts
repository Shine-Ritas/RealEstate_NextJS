import type { NextRequest } from "next/server";

import { jsonResponse, optionalAuthenticatedServices, runRoute } from "@/lib/bff";

export function GET(request: NextRequest) {
  return runRoute(request, async () => {
    const locale = request.nextUrl.searchParams.get("locale");
    return jsonResponse(
      await optionalAuthenticatedServices(request).properties.getOptions(
        locale === null ? {} : { locale: locale as "en" | "my" | "th" | "zh" },
        { cache: "no-store" },
      ),
    );
  });
}
