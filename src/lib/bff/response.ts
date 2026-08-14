import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { clearSessionCookie, setSessionCookie } from "@/lib/auth/session-cookie";
import { ApiError, isApiError } from "@/lib/api/errors";
import type { AuthResponse } from "@/types/auth";
import type { ClientSessionEnvelope } from "@/types/api";

export function jsonResponse<Data>(data: Data, status = 200): NextResponse<Data> {
  return NextResponse.json(data, { status });
}

export function authSessionResponse(
  auth: AuthResponse,
  status = 200,
): NextResponse<ClientSessionEnvelope> {
  const { user, token, verification_required } = auth.data;
  const response = NextResponse.json(
    {
      data: {
        user,
        expires_at: token.expires_at,
        device_name: token.device_name,
        ...(verification_required === undefined ? {} : { verification_required }),
      },
    },
    { status },
  );
  setSessionCookie(response, token);
  return response;
}

export function errorResponse(error: unknown, request?: NextRequest): NextResponse {
  const apiError = isApiError(error)
    ? error
    : new ApiError("An unexpected frontend server error occurred.", {
        status: 500,
        kind: "server",
        code: "FRONTEND_SERVER_ERROR",
        cause: error,
      });

  const response = NextResponse.json(
    {
      message: apiError.message,
      code: apiError.code ?? "UNKNOWN_ERROR",
      ...(apiError.errors === undefined ? {} : { errors: apiError.errors }),
    },
    { status: apiError.status || 500 },
  );

  if (apiError.retryAfter !== undefined) {
    response.headers.set("Retry-After", String(apiError.retryAfter));
  }
  if (apiError.status === 401 && request) clearSessionCookie(response);

  return response;
}

export async function runRoute(
  request: NextRequest,
  action: () => Promise<NextResponse>,
): Promise<NextResponse> {
  try {
    return await action();
  } catch (error) {
    return errorResponse(error, request);
  }
}
