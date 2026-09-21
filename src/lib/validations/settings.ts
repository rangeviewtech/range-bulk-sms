import { z } from 'zod';

export const accountProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(70, 'Full name cannot exceed 70 characters'),
  emailAddress: z.string().trim().email('Please enter a valid email address'),
  companyName: z.string().trim().max(100, 'Company name cannot exceed 100 characters').optional(),
});

export const smsPreferencesSchema = z.object({
  defaultSenderId: z
    .string()
    .trim()
    .min(1, 'Default Sender ID is required')
    .max(11, 'Sender ID cannot exceed 11 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Sender ID must be alphanumeric'),
  webhookUrl: z
    .string()
    .trim()
    .url('Please enter a valid webhook URL (e.g. https://domain.com/callback)')
    .optional()
    .or(z.literal('')),
});

export const tagFormSchema = z.object({
  name: z.string().trim().min(1, 'Tag name is required').max(30, 'Tag name cannot exceed 30 characters'),
  color: z.string().trim().min(1, 'Color selection is required'),
});

export const ticketReplySchema = z.object({
  message: z.string().trim().min(1, 'Reply message cannot be empty').max(2000, 'Reply message cannot exceed 2000 characters'),
});

export const securityPinSchema = z.object({
  password: z.string().min(1, 'Current password is required'),
  pin: z.string().regex(/^\d{6}$/, 'Screen lock PIN must be exactly 6 digits'),
});

export const securityMfaSetupSchema = z.object({
  token: z.string().regex(/^\d{6}$/, 'Authenticator code must be exactly 6 digits'),
});

export const securityMfaDisableSchema = z.object({
  password: z.string().min(1, 'Current password is required'),
  token: z.string().regex(/^\d{6}$/, 'Authenticator code must be exactly 6 digits'),
});

export type AccountProfileInput = z.infer<typeof accountProfileSchema>;
export type SmsPreferencesInput = z.infer<typeof smsPreferencesSchema>;
export type TagFormInput = z.infer<typeof tagFormSchema>;
export type TicketReplyInput = z.infer<typeof ticketReplySchema>;
export type SecurityPinInput = z.infer<typeof securityPinSchema>;
