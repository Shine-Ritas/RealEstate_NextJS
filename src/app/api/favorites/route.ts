import type { NextRequest } from "next/server";

import { ApiError } from "@/lib/api/errors";
import { authenticatedServices, jsonResponse, runRoute } from "@/lib/bff";

function positiveInteger(value: string | null, field: string): number | undefined {
  if (value === null) return undefined;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new ApiError("The given query parameters were invalid.", {
      status: 422,
      kind: "validation",
      code: "VALIDATION_FAILED",
      errors: { [field]: [`The ${field} field must be a positive integer.`] },
    });
  }
  return parsed;
}

export function GET(request: NextRequest) {
  return runRoute(request, async () => {
    const page = positiveInteger(request.nextUrl.searchParams.get("page"), "page");
    const perPage = positiveInteger(request.nextUrl.searchParams.get("per_page"), "per_page");
    const { services } = authenticatedServices(request);
    return jsonResponse(
      await services.favorites.list({
        ...(page === undefined ? {} : { page }),
        ...(perPage === undefined ? {} : { per_page: perPage }),
      }),
    );
  });
}
