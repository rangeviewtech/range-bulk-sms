import { z } from 'zod';

// Create contact schema
export const createContactSchema = z.object({
  firstName: z.string().max(100).optional(),
  lastName: z.string().max(100).optional(),
  phone: z.string().min(7, 'Phone number required').max(20),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  countryCode: z.string().default('+256'),
  customFields: z.record(z.unknown()).optional(),
  groupIds: z.array(z.string().uuid()).optional(),
});

// Update contact schema
export const updateContactSchema = createContactSchema.partial();

// Contact group schema
export const contactGroupSchema = z.object({
  name: z.string().min(1, 'Group name required').max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color').optional(),
});

// Contact tag schema
export const contactTagSchema = z.object({
  name: z.string().min(1, 'Tag name required').max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

// Bulk add to group
export const bulkGroupSchema = z.object({
  contactIds: z.array(z.string().uuid()).min(1, 'Select at least one contact'),
  groupId: z.string().uuid('Invalid group ID'),
});

// Import column mapping schema
export const importMappingSchema = z.object({
  phone: z.string().min(1, 'Phone column mapping required'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().optional(),
}).catchall(z.string().optional());

export type CreateContactInput = z.infer<typeof createContactSchema>;
export type UpdateContactInput = z.infer<typeof updateContactSchema>;
export type ContactGroupInput = z.infer<typeof contactGroupSchema>;
export type ContactTagInput = z.infer<typeof contactTagSchema>;
export type BulkGroupInput = z.infer<typeof bulkGroupSchema>;
export type ImportMappingInput = z.infer<typeof importMappingSchema>;
