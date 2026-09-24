import { z } from 'zod';

export const sendSmsSchema = z.object({
  senderId: z.string().min(1, 'Sender ID is required').max(11, 'Sender ID max 11 chars'),
  recipients: z.array(z.string().min(1)).min(1, 'At least one recipient is required').max(10000, 'Maximum 10,000 recipients per request'),
  message: z.string().min(1, 'Message is required').max(3200, 'Message too long (max 20 segments)'),
  templateId: z.string().uuid().optional(),
  variables: z.record(z.string()).optional(),
  personalizedMessages: z.array(z.object({
    phone: z.string(),
    message: z.string()
  })).optional(),
  idempotencyKey: z.string().optional(),
  draftId: z.string().optional(),
});

// Schedule SMS schema
export const scheduleSmsSchema = sendSmsSchema.extend({
  scheduledAt: z.string().datetime({ message: 'Valid datetime required' }),
  timezone: z.string().default('Africa/Kampala'),
  isRecurring: z.boolean().default(false),
  cronExpression: z.string().optional(),
});

// Campaign creation schema
export const createCampaignSchema = z.object({
  name: z.string().min(2, 'Campaign name required').max(100),
  senderId: z.string().min(1, 'Sender ID required').max(11),
  message: z.string().min(1, 'Message required').max(3200),
  variables: z.array(z.string()).default([]),
  groupIds: z.array(z.string().uuid()).default([]),
  scheduledAt: z.string().datetime().optional().nullable(),
  type: z.enum(['BROADCAST', 'RECURRING', 'DRIP']).default('BROADCAST'),
  cronExpression: z.string().optional().nullable(),
  maxOccurrences: z.number().int().positive().optional().nullable(),
});

// Update campaign schema
export const updateCampaignSchema = createCampaignSchema.partial();

// SMS template schema
export const smsTemplateSchema = z.object({
  name: z.string().min(2, 'Template name required').max(100),
  category: z.string().max(50).optional(),
  message: z.string().min(1, 'Template message required').max(3200),
  variables: z.array(z.string()).default([]),
  isFavorite: z.boolean().default(false),
  isShared: z.boolean().default(false),
});

export type SendSmsInput = z.infer<typeof sendSmsSchema>;
export type ScheduleSmsInput = z.infer<typeof scheduleSmsSchema>;
export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
export type UpdateCampaignInput = z.infer<typeof updateCampaignSchema>;
export type SmsTemplateInput = z.infer<typeof smsTemplateSchema>;

// Custom SMS variable schema (up to 20 custom variables per user)
export const customVariableSchema = z.object({
  key: z
    .string()
    .trim()
    .min(2, 'Variable key must be at least 2 characters')
    .max(30, 'Variable key cannot exceed 30 characters')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Key must start with a letter and contain only letters, numbers, or underscores'),
  label: z
    .string()
    .trim()
    .min(2, 'Label must be at least 2 characters')
    .max(60, 'Label cannot exceed 60 characters'),
  description: z
    .string()
    .trim()
    .max(200, 'Description cannot exceed 200 characters')
    .optional()
    .default(''),
  fallbackValue: z
    .string()
    .trim()
    .max(100, 'Fallback value cannot exceed 100 characters')
    .optional()
    .default(''),
  sampleValue: z
    .string()
    .trim()
    .min(1, 'Sample value is required for testing and live simulation')
    .max(100, 'Sample value cannot exceed 100 characters'),
  dataType: z
    .enum(['TEXT', 'NUMBER', 'CURRENCY', 'DATE', 'URL', 'PHONE'])
    .default('TEXT'),
});

export type CustomVariableInput = z.infer<typeof customVariableSchema>;
