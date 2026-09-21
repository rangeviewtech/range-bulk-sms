import { z } from 'zod';

export const GatewayTypeEnum = ['CLOUD', 'ANDROID', 'ESP32_GSM', 'SMPP'] as const;
export type GatewayType = (typeof GatewayTypeEnum)[number];

export const createGatewaySchema = z.object({
  name: z.string().trim().min(2, 'Gateway name must be at least 2 characters').max(50, 'Gateway name cannot exceed 50 characters'),
  type: z.enum(GatewayTypeEnum, { errorMap: () => ({ message: 'Please select a valid hardware type' }) }),
  maxThroughput: z.coerce.number().int('Rate limit must be a whole number').positive('Rate limit must be greater than zero').optional().nullable(),
});

export type CreateGatewayInput = z.infer<typeof createGatewaySchema>;
