import { z } from 'zod';

export const deliveryModeEnum = z.enum(['manual', 'groups', 'import']);

export const smsDraftMetadataSchema = z.record(z.string(), z.unknown()).optional().nullable();

/**
 * Validation schema for creating or updating a Quick SMS draft.
 * Structurally safe: accepts partial/incomplete work-in-progress content.
 */
export const createSmsDraftSchema = z.object({
  title: z.string().trim().max(120, 'Title cannot exceed 120 characters').optional().nullable(),
  senderId: z.string().trim().max(30, 'Sender ID cannot exceed 30 characters').optional().nullable(),
  deliveryMode: deliveryModeEnum.default('manual'),
  message: z.string().max(5000, 'Draft message content cannot exceed 5,000 characters').default(''),
  manualRecipients: z.string().max(100000, 'Recipients payload cannot exceed 100,000 characters').default(''),
  recipientCount: z.number().int().min(0).default(0),
  selectedGroupId: z.string().trim().max(100).optional().nullable(),
  importFilename: z.string().trim().max(255).optional().nullable(),
  importRowCount: z.number().int().min(0).optional().nullable(),
  templateId: z.string().trim().max(100).optional().nullable(),
  metadata: smsDraftMetadataSchema,
  version: z.number().int().min(1).default(1),
  isShared: z.boolean().default(false),
});

export const updateSmsDraftSchema = createSmsDraftSchema.partial().extend({
  version: z.number().int().min(1, 'Version number is required for concurrency control'),
});

export const listDraftsQuerySchema = z.object({
  search: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type CreateSmsDraftInput = z.infer<typeof createSmsDraftSchema>;
export type UpdateSmsDraftInput = z.infer<typeof updateSmsDraftSchema>;
export type ListDraftsQuery = z.infer<typeof listDraftsQuerySchema>;
