import * as z from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(254),
  password: z.string().min(1, 'Please enter your password'),
  turnstileToken: z.string().optional(), // For bot protection
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Please enter your full name (at least 2 characters)'),
    email: z.string().trim().email('Please enter a valid email address').max(254),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: 'Please accept the Terms & Conditions and Privacy Policy to continue',
    }),
    turnstileToken: z.string().max(2048).optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('Please enter a valid email address').max(254),
  turnstileToken: z.string().optional(),
});

export const resetPasswordSchema = z
  .object({
    token: z.string().uuid(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be at most 128 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
    turnstileToken: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export const verifyMfaSchema = z.object({
  token: z.string().regex(/^\d{6}$/, 'Please enter the complete 6-digit code'),
  turnstileToken: z.string().optional(),
});

export const pinSchema = z.object({
  pin: z.string().regex(/^\d{6}$/, 'Please enter your 6-digit PIN'),
  turnstileToken: z.string().optional(),
});

export const otpSchema = z.object({
  code: z.string().regex(/^\d{6}$/, 'Please enter the complete 6-digit verification code'),
  turnstileToken: z.string().optional(),
});
