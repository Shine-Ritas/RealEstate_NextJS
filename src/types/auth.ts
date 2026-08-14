import type { ApiSchema, JsonRequest, JsonResponse } from "@/lib/api/contract";

export type User = ApiSchema<"User">;
export type Token = ApiSchema<"Token">;
export type AuthResponse = JsonResponse<"login", 200>;
export type UserResponse = ApiSchema<"UserEnvelope">;

export type RegisterInput = JsonRequest<"register">;
export type LoginInput = JsonRequest<"login">;
export type GoogleLoginInput = JsonRequest<"googleLogin">;
export type ForgotPasswordInput = JsonRequest<"forgotPassword">;
export type ResetPasswordInput = JsonRequest<"resetPassword">;
export type VerifyEmailInput = JsonRequest<"verifyEmail">;
export type UpdateProfileInput = JsonRequest<"updateProfile">;
export type NewsletterInput = JsonRequest<"updateNewsletterSubscription">;
