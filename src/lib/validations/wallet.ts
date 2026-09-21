import { z } from 'zod';

// Deposit schema
export const depositSchema = z.object({
  amount: z.number().positive('Amount must be positive').max(100000000, 'Amount too large'),
  paymentMethod: z.enum(['bank_transfer', 'mobile_money', 'card', 'manual']),
  paymentRef: z.string().optional(),
  description: z.string().max(500).optional(),
});

// Admin adjustment schema
export const adjustmentSchema = z.object({
  walletId: z.string().uuid(),
  amount: z.number().refine((n) => n !== 0, 'Amount cannot be zero'),
  type: z.enum(['DEPOSIT', 'DEDUCTION', 'REFUND', 'ADJUSTMENT']),
  description: z.string().min(1, 'Description required for adjustments').max(500),
});

// Transaction filter schema
export const transactionFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  type: z.enum(['DEPOSIT', 'DEDUCTION', 'REFUND', 'ADJUSTMENT', 'COMMISSION_PAYOUT']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'amount']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// SMS pricing schema (admin)
export const smsPricingSchema = z.object({
  countryCode: z.string().trim().min(1, 'Country code is required').max(5, 'Max 5 chars'),
  countryName: z.string().trim().min(2, 'Country name is required').max(100),
  networkCode: z.string().trim().max(10).optional().or(z.literal('')),
  networkName: z.string().trim().max(100).optional().or(z.literal('')),
  costPerSms: z.coerce.number().positive('Cost per SMS must be positive'),
  sellingPrice: z.coerce.number().positive('Selling price must be positive'),
  currency: z.string().trim().min(1, 'Currency is required').default('UGX'),
});

export type DepositInput = z.infer<typeof depositSchema>;
export type AdjustmentInput = z.infer<typeof adjustmentSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
export type SmsPricingInput = z.infer<typeof smsPricingSchema>;
