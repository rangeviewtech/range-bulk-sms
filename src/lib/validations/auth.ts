import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().min(2, 'Username or email must be at least 2 characters'),
  password: z.string().min(1, 'Password is required'),
  turnstileToken: z.string().optional(), // For bot protection
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  turnstileToken: z.string().min(1, 'Please complete the security check'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const forgotPasswordSchema = z.object({
  email: z.string().min(2, 'Username must be at least 2 characters'),
  turnstileToken: z.string().optional(),
});

export const resetPasswordSchema = z.object({
  token: z.string(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  turnstileToken: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const verifyMfaSchema = z.object({
  token: z.string().length(6, 'MFA token must be exactly 6 digits'),
});

export const pinSchema = z.object({
  pin: z.string().length(6, 'PIN must be exactly 6 digits'),
});
