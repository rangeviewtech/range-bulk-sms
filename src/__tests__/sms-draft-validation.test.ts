import { describe, it, expect } from 'vitest';
import {
  createSmsDraftSchema,
  updateSmsDraftSchema,
  listDraftsQuerySchema,
} from '@/lib/validations/sms-draft';

describe('SMS Draft Validation Schemas', () => {
  describe('createSmsDraftSchema', () => {
    it('allows partial/incomplete work-in-progress input', () => {
      const minimal = {
        message: 'Hello world',
      };
      const parsed = createSmsDraftSchema.parse(minimal);
      expect(parsed.message).toBe('Hello world');
      expect(parsed.deliveryMode).toBe('manual');
      expect(parsed.manualRecipients).toBe('');
      expect(parsed.version).toBe(1);
    });

    it('allows empty message if recipients are provided', () => {
      const draft = {
        manualRecipients: '+256700123456',
        message: '',
      };
      const parsed = createSmsDraftSchema.parse(draft);
      expect(parsed.manualRecipients).toBe('+256700123456');
      expect(parsed.message).toBe('');
    });

    it('accepts custom title, senderId, and group mode', () => {
      const draft = {
        title: 'VIP Weekend Campaign',
        senderId: 'RANGESMS',
        deliveryMode: 'groups' as const,
        selectedGroupId: 'group-uuid-1',
        message: 'Exclusive weekend discounts!',
        recipientCount: 142,
      };
      const parsed = createSmsDraftSchema.parse(draft);
      expect(parsed.title).toBe('VIP Weekend Campaign');
      expect(parsed.senderId).toBe('RANGESMS');
      expect(parsed.deliveryMode).toBe('groups');
      expect(parsed.selectedGroupId).toBe('group-uuid-1');
      expect(parsed.recipientCount).toBe(142);
    });

    it('rejects title longer than 120 characters', () => {
      const draft = {
        title: 'A'.repeat(121),
      };
      expect(() => createSmsDraftSchema.parse(draft)).toThrow('Title cannot exceed 120 characters');
    });

    it('rejects invalid deliveryMode', () => {
      const draft = {
        deliveryMode: 'invalid_mode' as unknown as 'manual',
      };
      expect(() => createSmsDraftSchema.parse(draft)).toThrow();
    });

    it('rejects message exceeding 5000 characters', () => {
      const draft = {
        message: 'X'.repeat(5001),
      };
      expect(() => createSmsDraftSchema.parse(draft)).toThrow('Draft message content cannot exceed 5,000 characters');
    });
  });

  describe('updateSmsDraftSchema', () => {
    it('requires version number for concurrency control', () => {
      const updateWithoutVersion = {
        message: 'Updated body',
      };
      expect(() => updateSmsDraftSchema.parse(updateWithoutVersion)).toThrow('Required');
    });

    it('accepts valid version and partial updates', () => {
      const validUpdate = {
        message: 'Updated body with version',
        version: 2,
      };
      const parsed = updateSmsDraftSchema.parse(validUpdate);
      expect(parsed.message).toBe('Updated body with version');
      expect(parsed.version).toBe(2);
    });
  });

  describe('listDraftsQuerySchema', () => {
    it('provides sensible defaults for pagination', () => {
      const parsed = listDraftsQuerySchema.parse({});
      expect(parsed.limit).toBe(50);
      expect(parsed.offset).toBe(0);
      expect(parsed.search).toBeUndefined();
    });

    it('coerces string parameters to numbers', () => {
      const parsed = listDraftsQuerySchema.parse({
        limit: '25',
        offset: '10',
        search: 'campaign',
      });
      expect(parsed.limit).toBe(25);
      expect(parsed.offset).toBe(10);
      expect(parsed.search).toBe('campaign');
    });

    it('enforces maximum limit of 100', () => {
      expect(() => listDraftsQuerySchema.parse({ limit: 101 })).toThrow();
    });
  });
});
