import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Please enter your username or email address'),
  password: z.string().min(1, 'Please enter your password'),
  turnstileToken: z.string().optional(), // For bot protection
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Please enter your full name (at least 2 characters)'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[0-9]/, 'Password must include at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  turnstileToken: z.string().min(1, 'Please complete the security check to continue'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Please enter your email address'),
  turnstileToken: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[0-9]/, 'Password must include at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  turnstileToken: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const verifyMfaSchema = z.object({
  token: z.string().length(6, 'Please enter the complete 6-digit code'),
  turnstileToken: z.string().optional(),
});

export const pinSchema = z.object({
  pin: z.string().length(6, 'Please enter your 6-digit PIN'),
  turnstileToken: z.string().optional(),
});

export const otpSchema = z.object({
  code: z.string().length(6, 'Please enter the complete 6-digit verification code'),
  turnstileToken: z.string().optional(),
});

