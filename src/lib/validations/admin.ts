import { z } from 'zod';

export const createClientSchema = z.object({
  name: z.string().trim().min(2, 'Contact name must be at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  companyName: z.string().trim().min(2, 'Company name must be at least 2 characters').max(100),
  industry: z.string().trim().max(100).optional(),
  agentId: z.string().uuid().optional().nullable().or(z.literal('')),
  initialBalance: z.coerce.number().min(0, 'Initial balance must be zero or positive').default(0),
});

export const createAgentSchema = z.object({
  name: z.string().trim().min(2, 'Contact name must be at least 2 characters').max(100),
  email: z.string().trim().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
  companyName: z.string().trim().min(2, 'Agency name must be at least 2 characters').max(100),
  commissionRate: z.coerce
    .number()
    .min(0, 'Commission rate must be positive or zero')
    .max(100, 'Commission rate cannot exceed 100%')
    .default(5.0),
  bankName: z.string().trim().max(100).optional(),
  bankAccount: z.string().trim().max(50).optional(),
  mobileMoney: z.string().trim().max(50).optional(),
});

export const agentPayoutSchema = z.object({
  amount: z.coerce
    .number()
    .positive('Payout amount must be positive')
    .min(10000, 'Minimum payout amount is 10,000 UGX'),
  method: z.string().min(1, 'Payout method is required'),
  details: z.string().min(3, 'Payment details / account number are required'),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type AgentPayoutInput = z.infer<typeof agentPayoutSchema>;
