import { z } from 'zod';

// Supported App Types / Preset Categories
export const APP_PRESETS = [
  { id: 'web_portal', name: 'Web Portal / Dashboard', icon: 'Globe' },
  { id: 'mobile_app', name: 'Mobile App (iOS/Android)', icon: 'Smartphone' },
  { id: 'ecommerce', name: 'Shopify / E-Commerce', icon: 'ShoppingBag' },
  { id: 'erp_crm', name: 'Internal ERP / CRM', icon: 'Database' },
  { id: 'pos_system', name: 'POS & Billing Terminal', icon: 'CreditCard' },
  { id: 'iot_backend', name: 'IoT / Microservice Backend', icon: 'Server' },
  { id: 'custom', name: 'Custom Application', icon: 'Cpu' },
] as const;

export const QUOTA_PERIODS = ['DAILY', 'WEEKLY', 'MONTHLY', 'TOTAL', 'UNLIMITED'] as const;
export type QuotaPeriod = (typeof QUOTA_PERIODS)[number];

export const API_ENVIRONMENTS = ['production', 'sandbox', 'staging', 'development'] as const;
export type ApiEnvironment = (typeof API_ENVIRONMENTS)[number];

// Create API key schema
export const createApiKeySchema = z.object({
  name: z.string().min(2, 'Key name required').max(100),
  appName: z.string().min(2, 'App name must be at least 2 characters').max(100).default('Default App'),
  environment: z.enum(API_ENVIRONMENTS).default('production'),
  scopes: z.array(z.enum([
    'sms.send', 'sms.status', 'sms.schedule',
    'balance.read', 'contacts.read', 'contacts.write',
    'campaigns.read', 'campaigns.write',
    'sender_ids.read', 'delivery_reports.read',
    'webhooks.manage',
  ])).min(1, 'At least one scope required'),
  ipWhitelist: z.array(z.string().ip()).default([]),
  rateLimit: z.number().int().min(1).max(10000).default(100),
  rateLimitWindow: z.number().int().min(1).max(3600).default(60),
  quotaLimit: z.number().int().min(1).max(10000000).optional().nullable(),
  quotaPeriod: z.enum(QUOTA_PERIODS).default('MONTHLY'),
  alertThreshold: z.number().int().min(50).max(100).optional().nullable(),
  expiresAt: z.string().datetime().optional().nullable(),
  expiresInDays: z.number().int().min(1).max(365).optional().nullable(),
});

// Update API key schema (quota modification, renaming, etc.)
export const updateApiKeySchema = z.object({
  name: z.string().min(2).max(100).optional(),
  appName: z.string().min(2).max(100).optional(),
  environment: z.enum(API_ENVIRONMENTS).optional(),
  quotaLimit: z.number().int().min(1).max(10000000).optional().nullable(),
  quotaPeriod: z.enum(QUOTA_PERIODS).optional(),
  alertThreshold: z.number().int().min(50).max(100).optional().nullable(),
  rateLimit: z.number().int().min(1).max(10000).optional(),
  rateLimitWindow: z.number().int().min(1).max(3600).optional(),
  ipWhitelist: z.array(z.string().ip()).optional(),
  status: z.enum(['ACTIVE', 'REVOKED']).optional(),
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
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>;
export type WebhookInput = z.infer<typeof webhookSchema>;
