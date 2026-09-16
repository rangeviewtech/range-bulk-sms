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
  amount: z.number().nonzero('Amount cannot be zero'),
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
  countryCode: z.string().min(1).max(5),
  countryName: z.string().min(1).max(100),
  networkCode: z.string().max(10).optional(),
  networkName: z.string().max(100).optional(),
  costPerSms: z.number().positive('Cost must be positive'),
  sellingPrice: z.number().positive('Selling price must be positive'),
  currency: z.string().default('UGX'),
});

export type DepositInput = z.infer<typeof depositSchema>;
export type AdjustmentInput = z.infer<typeof adjustmentSchema>;
export type TransactionFilterInput = z.infer<typeof transactionFilterSchema>;
export type SmsPricingInput = z.infer<typeof smsPricingSchema>;
