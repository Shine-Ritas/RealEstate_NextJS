export type ValidationErrors = Record<string, string[]>;

export interface ServiceRequestOptions {
  signal?: AbortSignal;
  cache?: RequestCache;
  revalidate?: number | false;
  tags?: string[];
}

export interface ClientSession {
  user: import("./auth").User;
  expires_at: string;
  device_name: string;
  verification_required?: boolean;
}

export interface ClientSessionEnvelope {
  data: ClientSession;
}
