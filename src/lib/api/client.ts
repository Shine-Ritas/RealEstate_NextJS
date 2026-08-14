import { ApiError, getApiErrorKind } from "./errors";
import { buildQueryString, type QueryRecord } from "./query";

export type AuthMode = "none" | "optional" | "required";

export interface NextFetchPolicy {
  revalidate?: number | false;
  tags?: string[];
}

export interface ApiClientOptions {
  baseUrl: string;
  token?: string;
  onUnauthorized?: () => void | Promise<void>;
  fetcher?: typeof fetch;
}

export interface ApiRequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: QueryRecord;
  body?: unknown;
  auth?: AuthMode;
  headers?: HeadersInit;
  signal?: AbortSignal;
  cache?: RequestCache;
  next?: NextFetchPolicy;
}

interface ErrorPayload {
  message?: string;
  code?: string;
  errors?: Record<string, string[]>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toErrorPayload(value: unknown): ErrorPayload {
  if (!isRecord(value)) return {};

  const payload: ErrorPayload = {};
  if (typeof value.message === "string") payload.message = value.message;
  if (typeof value.code === "string") payload.code = value.code;

  if (isRecord(value.errors)) {
    const errors: Record<string, string[]> = {};
    for (const [field, messages] of Object.entries(value.errors)) {
      if (Array.isArray(messages) && messages.every((message) => typeof message === "string")) {
        errors[field] = messages;
      }
    }
    payload.errors = errors;
  }

  return payload;
}

function parseRetryAfter(value: string | null): number | undefined {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds);

  const timestamp = Date.parse(value);
  return Number.isNaN(timestamp)
    ? undefined
    : Math.max(0, Math.ceil((timestamp - Date.now()) / 1000));
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return undefined;
  const text = await response.text();
  if (!text) return undefined;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("json")) return text;

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly token?: string;
  private readonly onUnauthorized?: () => void | Promise<void>;
  private readonly fetcher: typeof fetch;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.token = options.token;
    this.onUnauthorized = options.onUnauthorized;
    this.fetcher = options.fetcher ?? fetch;
  }

  async request<ResponseBody>(
    path: string,
    options: ApiRequestOptions = {},
  ): Promise<ResponseBody> {
    const auth = options.auth ?? "none";
    if (auth === "required" && !this.token) {
      throw new ApiError("Authentication is required.", {
        status: 401,
        kind: "authentication",
        code: "MISSING_AUTH_TOKEN",
      });
    }

    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    if (auth !== "none" && this.token) headers.set("Authorization", `Bearer ${this.token}`);

    let body: BodyInit | undefined;
    if (options.body instanceof FormData) {
      body = options.body;
    } else if (options.body !== undefined) {
      headers.set("Content-Type", "application/json");
      body = JSON.stringify(options.body);
    }

    const requestInit: RequestInit & { next?: NextFetchPolicy } = {
      method: options.method ?? "GET",
      headers,
    };
    if (body !== undefined) requestInit.body = body;
    if (options.signal !== undefined) requestInit.signal = options.signal;
    if (options.cache !== undefined) requestInit.cache = options.cache;
    if (options.next !== undefined) requestInit.next = options.next;

    let response: Response;
    try {
      response = await this.fetcher(
        `${this.baseUrl}${path}${buildQueryString(options.query)}`,
        requestInit,
      );
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      throw new ApiError("Unable to reach the PrimeProperty API.", {
        status: 0,
        kind: "network",
        code: "NETWORK_ERROR",
        cause: error,
      });
    }

    const parsedBody = await parseBody(response);
    if (response.ok) return parsedBody as ResponseBody;

    if (response.status === 401 && this.onUnauthorized) await this.onUnauthorized();

    const payload = toErrorPayload(parsedBody);
    throw new ApiError(
      payload.message ?? `PrimeProperty API request failed (${response.status}).`,
      {
        status: response.status,
        kind: getApiErrorKind(response.status),
        ...(payload.code === undefined ? {} : { code: payload.code }),
        ...(payload.errors === undefined ? {} : { errors: payload.errors }),
        ...(parseRetryAfter(response.headers.get("retry-after")) === undefined
          ? {}
          : { retryAfter: parseRetryAfter(response.headers.get("retry-after")) }),
      },
    );
  }
}
