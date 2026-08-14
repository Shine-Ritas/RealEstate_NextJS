import type { NextRequest } from "next/server";

import { authenticatedServices, jsonResponse, runRoute } from "@/lib/bff";
import type { ClientSessionEnvelope } from "@/types/api";

export function GET(request: NextRequest) {
  return runRoute(request, async () => {
    const { services, session } = authenticatedServices(request);
    const profile = await services.profile.get();
    return jsonResponse<ClientSessionEnvelope>({
      data: {
        user: profile.data,
        expires_at: session.expires_at,
        device_name: session.device_name,
        verification_required: !profile.data.email_verified,
      },
    });
  });
}
