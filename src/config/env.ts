import "server-only";

import { z } from "zod";

const serverEnvSchema = z.object({
  PRIMEPROPERTY_API_URL: z
    .url()
    .default("https://primeproperty.cfd/api/v1")
    .transform((url) => url.replace(/\/$/, "")),
  PRIMEPROPERTY_SESSION_COOKIE: z.string().min(1).default("primeproperty_session"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cachedEnv: ServerEnv | undefined;

export function getServerEnv(): ServerEnv {
  cachedEnv ??= serverEnvSchema.parse(process.env);
  return cachedEnv;
}
