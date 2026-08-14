import type { NextRequest } from "next/server";
import type { z } from "zod";

import { ApiError } from "@/lib/api/errors";

export function zodErrors(error: z.ZodError): Record<string, string[]> {
  const errors: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const field = issue.path.join(".") || "request";
    (errors[field] ??= []).push(issue.message);
  }

  return errors;
}

export function parseWithSchema<Schema extends z.ZodType>(
  value: unknown,
  schema: Schema,
): z.output<Schema> {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw new ApiError("The given data was invalid.", {
      status: 422,
      kind: "validation",
      code: "VALIDATION_FAILED",
      errors: zodErrors(result.error),
    });
  }
  return result.data;
}

export async function parseJsonBody<Schema extends z.ZodType>(
  request: NextRequest,
  schema: Schema,
): Promise<z.output<Schema>> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiError("The request body must be valid JSON.", {
      status: 422,
      kind: "validation",
      code: "INVALID_JSON",
      errors: { request: ["The request body must be valid JSON."] },
    });
  }

  return parseWithSchema(body, schema);
}
