import "server-only";

import { Buffer } from "node:buffer";

import type { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { getServerEnv } from "@/config/env";
import type { Token } from "@/types/auth";

const sessionCookieSchema = z.object({
  access_token: z.string().min(1),
  expires_at: z.string().datetime(),
  device_name: z.string().min(1),
});

export type SessionCookie = z.infer<typeof sessionCookieSchema>;

function encodeSessionCookie(payload: SessionCookie): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

function decodeSessionCookie(value: string): SessionCookie | undefined {
  try {
    const decoded = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as unknown;
    const result = sessionCookieSchema.safeParse(decoded);
    return result.success ? result.data : undefined;
  } catch {
    return undefined;
  }
}

export function readSessionCookie(request: NextRequest): SessionCookie | undefined {
  const value = request.cookies.get(getServerEnv().PRIMEPROPERTY_SESSION_COOKIE)?.value;
  return value ? decodeSessionCookie(value) : undefined;
}

export function setSessionCookie(response: NextResponse, token: Token): void {
  const expires = new Date(token.expires_at);
  response.cookies.set({
    name: getServerEnv().PRIMEPROPERTY_SESSION_COOKIE,
    value: encodeSessionCookie(token),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: getServerEnv().PRIMEPROPERTY_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });
}
