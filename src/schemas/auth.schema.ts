import { z } from "zod";

const deviceName = z.string().trim().min(1).max(120);
const password = z.string().min(8);

export const registerSchema = z
  .object({
    name: z.string().trim().min(1).max(255),
    email: z.email(),
    password,
    password_confirmation: password,
    device_name: deviceName,
  })
  .refine((value) => value.password === value.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match.",
  });

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
  device_name: deviceName,
});

export const googleLoginSchema = z.object({
  access_token: z.string().min(1),
  device_name: deviceName,
});

export const forgotPasswordSchema = z.object({ email: z.email() });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1),
    email: z.email(),
    password,
    password_confirmation: password,
  })
  .refine((value) => value.password === value.password_confirmation, {
    path: ["password_confirmation"],
    message: "Passwords do not match.",
  });

export const verifyEmailSchema = z.object({ code: z.string().regex(/^\d{6}$/) });

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(2).max(255).optional(),
    email: z.email().optional(),
  })
  .refine((value) => value.name !== undefined || value.email !== undefined, {
    message: "At least one profile field is required.",
  });
