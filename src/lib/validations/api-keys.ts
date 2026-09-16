import { z } from 'zod';

// Create API key schema
export const createApiKeySchema = z.object({
  name: z.string().min(2, 'Key name required').max(100),
  scopes: z.array(z.enum([
    'sms.send', 'sms.status', 'sms.schedule',
    'balance.read', 'contacts.read', 'contacts.write',
    'campaigns.read', 'campaigns.write',
    'sender_ids.read', 'delivery_reports.read',
    'webhooks.manage',
  ])).min(1, 'At least one scope required'),
  ipWhitelist: z.array(z.string().ip()).default([]),
  rateLimit: z.number().int().min(1).max(10000).default(100),
  expiresAt: z.string().datetime().optional().nullable(),
});

// Webhook configuration schema
export const webhookSchema = z.object({
  url: z.string().url('Valid URL required'),
  events: z.array(z.enum([
    'SMS_SENT', 'SMS_DELIVERED', 'SMS_FAILED',
    'CAMPAIGN_COMPLETED', 'CAMPAIGN_FAILED',
    'BALANCE_CHANGED', 'API_EVENT',
  ])).min(1, 'Select at least one event'),
  description: z.string().max(500).optional(),
  isActive: z.boolean().default(true),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type WebhookInput = z.infer<typeof webhookSchema>;
