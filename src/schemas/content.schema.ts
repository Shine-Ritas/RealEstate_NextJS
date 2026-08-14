import { z } from "zod";

export const chatSchema = z.object({
  message: z.string().min(1).max(2000),
  conversation: z
    .array(
      z.object({
        type: z.enum(["user", "assistant"]),
        text: z.string().min(1).max(2000),
      }),
    )
    .max(10)
    .optional(),
});

export const newsletterSchema = z.object({ email: z.email() });
