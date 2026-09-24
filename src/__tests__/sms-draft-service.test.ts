import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  listSmsDrafts,
  getSmsDraftById,
  createSmsDraft,
  updateSmsDraft,
  deleteSmsDraft,
  duplicateSmsDraft,
  consumeDraftOnSend,
} from '@/lib/sms/draft-service';
import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    smsDraft: {
      findMany: vi.fn(),
      count: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    client: {
      findFirst: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('SMS Draft Service Layer', () => {
  const tenantA = { userId: 'user-1', organizationId: 'org-alpha' };
  const tenantB = { userId: 'user-2', organizationId: 'org-beta' };
  const standaloneUser = { userId: 'user-3', organizationId: null };

  const mockDraft = {
    id: 'draft-123',
    userId: 'user-1',
    organizationId: 'org-alpha',
    title: 'Flash Sale Reminder',
    senderId: 'RANGESMS',
    deliveryMode: 'manual',
    message: 'Don not miss our exclusive weekend deals!',
    manualRecipients: '+256700123456, +256772123456',
    recipientCount: 2,
    selectedGroupId: null,
    importFilename: null,
    importRowCount: null,
    templateId: null,
    metadata: null,
    version: 1,
    isShared: false,
    lastEditedById: 'user-1',
    lastAutosavedAt: null,
    createdAt: new Date('2026-09-24T00:00:00Z'),
    updatedAt: new Date('2026-09-24T00:00:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('listSmsDrafts', () => {
    it('scopes listing strictly to tenant organization', async () => {
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.findMany.mockResolvedValue([mockDraft]);
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.count.mockResolvedValue(1);

      const result = await listSmsDrafts(tenantA, { limit: 10, offset: 0 });
      expect(result.items).toHaveLength(1);
      expect(result.total).toBe(1);

      expect(prisma.smsDraft.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ organizationId: 'org-alpha' }),
        })
      );
    });

    it('scopes listing strictly to userId for standalone users without org', async () => {
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.findMany.mockResolvedValue([]);
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.count.mockResolvedValue(0);

      await listSmsDrafts(standaloneUser, { limit: 10, offset: 0 });

      expect(prisma.smsDraft.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-3' }),
        })
      );
    });
  });

  describe('getSmsDraftById', () => {
    it('returns the draft when it belongs to the tenant', async () => {
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.findFirst.mockResolvedValue(mockDraft);

      const draft = await getSmsDraftById(tenantA, 'draft-123');
      expect(draft.id).toBe('draft-123');
      expect(draft.title).toBe('Flash Sale Reminder');
    });

    it('throws 404 when draft does not exist or belongs to another tenant', async () => {
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.findFirst.mockResolvedValue(null);

      await expect(getSmsDraftById(tenantB, 'draft-123')).rejects.toThrow(/SMS draft not found/);
    });
  });

  describe('createSmsDraft', () => {
    it('creates draft with auto-derived title if title not provided', async () => {
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.create.mockImplementation(({ data }) => Promise.resolve({ id: 'new-id', ...data }));

      const created = await createSmsDraft(tenantA, {
        deliveryMode: 'manual',
        message: 'Hello valued client, your account statement is ready.',
        manualRecipients: '+256700111222',
        recipientCount: 1,
        version: 1,
        isShared: false,
      });

      expect(created.title).toBe('Hello valued client, your account sta...');
      expect(created.version).toBe(1);
      expect(created.organizationId).toBe('org-alpha');
      expect(created.userId).toBe('user-1');
    });

    it('uses provided custom title', async () => {
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.create.mockImplementation(({ data }) => Promise.resolve({ id: 'new-id', ...data }));

      const created = await createSmsDraft(tenantA, {
        title: 'Custom Promo Broadcast',
        deliveryMode: 'manual',
        message: 'Hello!',
        manualRecipients: '',
        recipientCount: 0,
        version: 1,
        isShared: false,
      });

      expect(created.title).toBe('Custom Promo Broadcast');
    });
  });

  describe('updateSmsDraft', () => {
    it('updates draft and increments version', async () => {
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.findFirst.mockResolvedValue(mockDraft);
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.update.mockResolvedValue({
        ...mockDraft,
        message: 'Updated message content',
        version: 2,
      });

      const updated = await updateSmsDraft(tenantA, 'draft-123', {
        message: 'Updated message content',
        version: 1, // matches existing version 1
      });

      expect(updated.version).toBe(2);
      expect(updated.message).toBe('Updated message content');
      expect(prisma.smsDraft.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ version: { increment: 1 } }),
        })
      );
    });

    it('throws 409 Conflict if version does not match existing version in DB', async () => {
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.findFirst.mockResolvedValue({
        ...mockDraft,
        version: 3, // existing in DB is version 3
      });

      await expect(
        updateSmsDraft(tenantA, 'draft-123', {
          message: 'Stale update',
          version: 2, // client submitted version 2
        })
      ).rejects.toThrow(AppError);

      try {
        await updateSmsDraft(tenantA, 'draft-123', {
          message: 'Stale update',
          version: 2,
        });
      } catch (err: unknown) {
        expect((err as AppError).statusCode).toBe(409);
        expect((err as AppError).message).toContain('modified elsewhere');
      }
    });
  });

  describe('duplicateSmsDraft', () => {
    it('clones draft with "(Copy)" title and resets version to 1', async () => {
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.findFirst.mockResolvedValue(mockDraft);
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.create.mockImplementation(({ data }) => Promise.resolve({ id: 'clone-id', ...data }));

      const duplicated = await duplicateSmsDraft(tenantA, 'draft-123');

      expect(duplicated.title).toBe('Flash Sale Reminder (Copy)');
      expect(duplicated.version).toBe(1);
      expect(duplicated.message).toBe(mockDraft.message);
      expect(duplicated.manualRecipients).toBe(mockDraft.manualRecipients);
    });
  });

  describe('deleteSmsDraft & consumeDraftOnSend', () => {
    it('deletes draft successfully', async () => {
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.findFirst.mockResolvedValue(mockDraft);
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.delete.mockResolvedValue(mockDraft);

      const deleted = await deleteSmsDraft(tenantA, 'draft-123');
      expect(deleted.id).toBe('draft-123');
      expect(prisma.smsDraft.delete).toHaveBeenCalledWith({ where: { id: 'draft-123' } });
    });

    it('consumeDraftOnSend silently consumes draft on send success', async () => {
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.findFirst.mockResolvedValue(mockDraft);
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.delete.mockResolvedValue(mockDraft);

      await expect(consumeDraftOnSend(tenantA, 'draft-123')).resolves.not.toThrow();
    });

    it('consumeDraftOnSend handles non-existent draft gracefully without throwing', async () => {
      // @ts-expect-error Mock prisma method
      prisma.smsDraft.findFirst.mockResolvedValue(null);

      await expect(consumeDraftOnSend(tenantA, 'non-existent')).resolves.not.toThrow();
    });
  });
});
