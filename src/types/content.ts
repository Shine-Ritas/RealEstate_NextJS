import type { ApiSchema, JsonRequest, JsonResponse, OperationQuery } from "@/lib/api/contract";

export type ServiceEnvelope = ApiSchema<"ServiceEnvelope">;
export type BootstrapEnvelope = ApiSchema<"BootstrapEnvelope">;
export type HomeEnvelope = ApiSchema<"HomeEnvelope">;
export type LegalEnvelope = ApiSchema<"LegalEnvelope">;
export type LanguageEnvelope = ApiSchema<"LanguageEnvelope">;
export type LanguageParams = OperationQuery<"getLanguage">;
export type ChatInput = JsonRequest<"chat">;
export type ChatResponse = JsonResponse<"chat", 200>;
