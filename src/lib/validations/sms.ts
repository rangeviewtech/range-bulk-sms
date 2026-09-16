import { z } from 'zod';

// Send SMS schema
export const sendSmsSchema = z.object({
  senderId: z.string().min(1, 'Sender ID is required').max(11, 'Sender ID max 11 chars'),
  recipients: z.array(z.string().min(1)).min(1, 'At least one recipient is required').max(10000, 'Maximum 10,000 recipients per request'),
  message: z.string().min(1, 'Message is required').max(3200, 'Message too long (max 20 segments)'),
  templateId: z.string().uuid().optional(),
  variables: z.record(z.string()).optional(),
  idempotencyKey: z.string().optional(),
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
  groupIds: z.array(z.string().uuid()).min(1, 'Select at least one contact group'),
  scheduledAt: z.string().datetime().optional().nullable(),
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
