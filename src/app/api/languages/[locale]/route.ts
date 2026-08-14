import type { NextRequest } from "next/server";

import { ApiError } from "@/lib/api/errors";
import { jsonResponse, publicServices, runRoute } from "@/lib/bff";

const SUPPORTED_LOCALES = new Set(["en", "my", "th", "zh"]);

interface RouteContext {
  params: Promise<{ locale: string }>;
}

export function GET(request: NextRequest, context: RouteContext) {
  return runRoute(request, async () => {
    const { locale } = await context.params;
    if (!SUPPORTED_LOCALES.has(locale)) {
      throw new ApiError("The requested locale is not supported.", {
        status: 404,
        kind: "not_found",
        code: "LOCALE_NOT_FOUND",
      });
    }
    const layout = request.nextUrl.searchParams.get("layout");
    return jsonResponse(
      await publicServices().content.getLanguage(
        locale as "en" | "my" | "th" | "zh",
        layout === null ? {} : { layout: layout as "guest" | "guest_v2" },
      ),
    );
  });
}
