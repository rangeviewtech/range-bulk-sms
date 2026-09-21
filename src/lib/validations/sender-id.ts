import { z } from 'zod';

// Apply for sender ID
export const senderIdApplicationSchema = z.object({
  senderId: z.string()
    .min(3, 'Sender ID must be at least 3 characters')
    .max(11, 'Sender ID cannot exceed 11 characters')
    .regex(/^[a-zA-Z0-9]+$/, 'Sender ID must be alphanumeric'),
  purpose: z.string().min(10, 'Please describe the purpose').max(500),
});

// Admin approve/reject sender ID
export const senderIdActionSchema = z.object({
  senderIdId: z.string().uuid(),
  action: z.enum(['approve', 'reject', 'suspend']),
  reason: z.string().max(500).optional(),
});

// Admin provider config schema
export const smsProviderSchema = z.object({
  name: z.string().trim().min(2, 'Provider identifier must be at least 2 characters').max(50),
  displayName: z.string().trim().min(2, 'Display name must be at least 2 characters').max(100),
  type: z.enum(['HTTP', 'SMPP', 'SDK']).default('HTTP'),
  baseUrl: z.string().trim().url('Must be a valid URL (e.g. https://api.gateway.com/v1)').optional().or(z.literal('')),
  apiKey: z.string().trim().optional(),
  apiSecret: z.string().trim().optional(),
  username: z.string().trim().optional(),
  password: z.string().trim().optional(),
  senderId: z.string().trim().max(11).optional(),
  costPerSms: z.coerce.number().min(0, 'Cost must be zero or positive').default(0),
  priority: z.coerce.number().int().min(1, 'Priority must be at least 1').default(1),
  isActive: z.boolean().default(true),
  isFallback: z.boolean().default(false),
  maxThroughput: z.coerce.number().int().positive('Max throughput must be positive').default(500),
  supportsDlr: z.boolean().default(false),
});

// Admin user management schemas
export const createUserSchema = z.object({
  email: z.string().email('Valid email required'),
  name: z.string().min(2, 'Name required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[a-z]/, 'Must contain lowercase letter')
    .regex(/[0-9]/, 'Must contain number'),
  role: z.enum(['ADMIN', 'CLIENT', 'AGENT', 'USER']),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: z.string().email().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'PENDING']).optional(),
  role: z.enum(['ADMIN', 'CLIENT', 'AGENT', 'USER']).optional(),
});

// Support ticket schema
export const createTicketSchema = z.object({
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters').max(200),
  category: z.string().trim().min(1, 'Category is required').max(100),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  message: z.string().trim().min(10, 'Please provide at least 10 characters describing your issue').max(5000),
});

export const ticketMessageSchema = z.object({
  message: z.string().min(1, 'Message required').max(5000),
});

export type SenderIdApplicationInput = z.infer<typeof senderIdApplicationSchema>;
export type SenderIdActionInput = z.infer<typeof senderIdActionSchema>;
export type SmsProviderInput = z.infer<typeof smsProviderSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type TicketMessageInput = z.infer<typeof ticketMessageSchema>;
