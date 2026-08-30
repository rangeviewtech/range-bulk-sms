import { z } from 'zod';
export const exampleItemSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.enum(['todo', 'in_progress', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
});
