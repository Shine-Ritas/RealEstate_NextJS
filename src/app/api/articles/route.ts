import type { NextRequest } from "next/server";

import { ApiError } from "@/lib/api/errors";
import { jsonResponse, publicServices, runRoute } from "@/lib/bff";

function optionalPositiveInteger(value: string | null, field: string): number | undefined {
  if (value === null) return undefined;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1) {
    throw new ApiError("The given query parameters were invalid.", {
      status: 422,
      kind: "validation",
      code: "VALIDATION_FAILED",
      errors: { [field]: [`The ${field} field must be a positive integer.`] },
    });
  }
  return number;
}

export function GET(request: NextRequest) {
  return runRoute(request, async () => {
    const page = optionalPositiveInteger(request.nextUrl.searchParams.get("page"), "page");
    const perPage = optionalPositiveInteger(
      request.nextUrl.searchParams.get("per_page"),
      "per_page",
    );
    const tag = request.nextUrl.searchParams.get("tag");
    return jsonResponse(
      await publicServices().articles.list({
        ...(tag === null ? {} : { tag }),
        ...(page === undefined ? {} : { page }),
        ...(perPage === undefined ? {} : { per_page: perPage }),
      }),
    );
  });
}
