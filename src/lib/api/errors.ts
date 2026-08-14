import type { ValidationErrors } from "@/types/api";

export type ApiErrorKind =
  | "network"
  | "authentication"
  | "authorization"
  | "validation"
  | "not_found"
  | "rate_limit"
  | "server"
  | "unknown";

export interface ApiErrorOptions {
  status: number;
  kind: ApiErrorKind;
  code?: string;
  errors?: ValidationErrors;
  retryAfter?: number;
  cause?: unknown;
}

export class ApiError extends Error {
  readonly status: number;
  readonly kind: ApiErrorKind;
  readonly code?: string;
  readonly errors?: ValidationErrors;
  readonly retryAfter?: number;

  constructor(message: string, options: ApiErrorOptions) {
    super(message, { cause: options.cause });
    this.name = "ApiError";
    this.status = options.status;
    this.kind = options.kind;
    this.code = options.code;
    this.errors = options.errors;
    this.retryAfter = options.retryAfter;
  }
}

export function getApiErrorKind(status: number): ApiErrorKind {
  if (status === 401) return "authentication";
  if (status === 403) return "authorization";
  if (status === 404) return "not_found";
  if (status === 422) return "validation";
  if (status === 429) return "rate_limit";
  if (status >= 500) return "server";
  return "unknown";
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof ApiError;
}

export function isValidationError(error: unknown): error is ApiError & {
  errors: ValidationErrors;
} {
  return error instanceof ApiError && error.kind === "validation" && error.errors !== undefined;
}

export function getFieldError(error: unknown, field: string): string | undefined {
  return isValidationError(error) ? error.errors[field]?.[0] : undefined;
}

export function getFirstValidationError(error: unknown): string | undefined {
  if (!isValidationError(error)) return undefined;

  for (const messages of Object.values(error.errors)) {
    const first = messages[0];
    if (first) return first;
  }

  return undefined;
}

export function getSafeErrorMessage(error: unknown, fallback = "Something went wrong."): string {
  return error instanceof ApiError ? error.message : fallback;
}
