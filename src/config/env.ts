import { z } from 'zod';

const envSchema = z.object({
  // Required in all environments
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),
  DATABASE_URL: z.string().url(),
  
  // Optional but recommended
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),

  // MTN MoMo Collection credentials (server-only; leave empty to disable top-ups)
  MTN_MOMO_ENVIRONMENT: z.enum(['sandbox', 'production']).optional(),
  MTN_MOMO_COLLECTION_SUBSCRIPTION_KEY: z.string().optional(),
  MTN_MOMO_API_USER: z.string().optional(),
  MTN_MOMO_API_KEY: z.string().optional(),
  MTN_MOMO_CALLBACK_URL: z.string().url().or(z.literal('')).optional(),
  MTN_MOMO_TARGET_ENVIRONMENT: z.string().optional(),
  MTN_MOMO_CURRENCY: z.string().length(3).or(z.literal('')).optional(),
  
  // Webhooks
  TELEGRAM_WEBHOOK_SECRET: z.string().optional(),
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  
  // Public variables (exposed to client)
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
