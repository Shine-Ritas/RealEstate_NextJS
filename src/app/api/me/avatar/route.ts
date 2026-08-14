import type { NextRequest } from "next/server";

import { ApiError } from "@/lib/api/errors";
import { assertSameOrigin, authenticatedServices, jsonResponse, runRoute } from "@/lib/bff";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;

export function POST(request: NextRequest) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const formData = await request.formData();
    const avatar = formData.get("avatar");
    if (!(avatar instanceof File)) {
      throw new ApiError("An avatar image is required.", {
        status: 422,
        kind: "validation",
        code: "VALIDATION_FAILED",
        errors: { avatar: ["An avatar image is required."] },
      });
    }
    if (!avatar.type.startsWith("image/") || avatar.size > MAX_AVATAR_BYTES) {
      throw new ApiError("The avatar must be an image no larger than 2 MB.", {
        status: 422,
        kind: "validation",
        code: "VALIDATION_FAILED",
        errors: { avatar: ["The avatar must be an image no larger than 2 MB."] },
      });
    }

    const { services } = authenticatedServices(request);
    return jsonResponse(await services.profile.uploadAvatar(avatar, avatar.name));
  });
}

export function DELETE(request: NextRequest) {
  return runRoute(request, async () => {
    assertSameOrigin(request);
    const { services } = authenticatedServices(request);
    return jsonResponse(await services.profile.deleteAvatar());
  });
}
