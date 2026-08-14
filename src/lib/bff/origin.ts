import type { NextRequest } from "next/server";

import { ApiError } from "@/lib/api/errors";

export function assertSameOrigin(request: NextRequest): void {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite === "cross-site") {
    throw new ApiError("Cross-site requests are not allowed.", {
      status: 403,
      kind: "authorization",
      code: "CROSS_SITE_REQUEST",
    });
  }

  const origin = request.headers.get("origin");
  if (!origin) return;

  const forwardedHost = request.headers.get("x-forwarded-host");
  const host = forwardedHost ?? request.headers.get("host");
  if (!host || new URL(origin).host !== host) {
    throw new ApiError("Request origin does not match this application.", {
      status: 403,
      kind: "authorization",
      code: "ORIGIN_MISMATCH",
    });
  }
}
