import { describe, it, expect } from 'vitest';
import { contactGroupSchema, bulkGroupSchema } from '@/lib/validations/contacts';

describe('Contact Group Validation & Schema Tests', () => {
  it('validates a valid group with name, description, and color', () => {
    const validData = {
      name: 'VIP Customers',
      description: 'High volume enterprise clients',
      color: '#04648C',
    };
    const parsed = contactGroupSchema.parse(validData);
    expect(parsed.name).toBe('VIP Customers');
    expect(parsed.description).toBe('High volume enterprise clients');
    expect(parsed.color).toBe('#04648C');
  });

  it('rejects an empty group name', () => {
    const invalidData = {
      name: '',
      description: 'Some description',
    };
    expect(() => contactGroupSchema.parse(invalidData)).toThrow();
  });

  it('rejects group name exceeding 100 characters', () => {
    const longName = 'A'.repeat(101);
    expect(() => contactGroupSchema.parse({ name: longName })).toThrow();
  });

  it('rejects invalid hex color', () => {
    const invalidColor = {
      name: 'Retail Leads',
      color: 'not-a-color',
    };
    expect(() => contactGroupSchema.parse(invalidColor)).toThrow(/Invalid hex color/);
  });

  it('accepts partial updates for edit flows', () => {
    const partialSchema = contactGroupSchema.partial();
    const updated = partialSchema.parse({
      description: 'Updated description only',
    });
    expect(updated.description).toBe('Updated description only');
  });

  it('validates bulk group membership addition', () => {
    const bulkData = {
      groupId: '123e4567-e89b-12d3-a456-426614174000',
      contactIds: [
        '123e4567-e89b-12d3-a456-426614174001',
        '123e4567-e89b-12d3-a456-426614174002',
      ],
    };
    const parsed = bulkGroupSchema.parse(bulkData);
    expect(parsed.contactIds.length).toBe(2);
  });

  it('rejects empty contactIds array in bulk group membership', () => {
    const emptyBulk = {
      groupId: '123e4567-e89b-12d3-a456-426614174000',
      contactIds: [],
    };
    expect(() => bulkGroupSchema.parse(emptyBulk)).toThrow(/Select at least one contact/);
  });
});
