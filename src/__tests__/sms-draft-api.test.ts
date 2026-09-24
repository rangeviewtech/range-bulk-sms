import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('server-only', () => ({}));

import { GET as listDraftsRoute, POST as createDraftRoute } from '@/app/api/sms/drafts/route';
import {
  GET as getDraftRoute,
  PUT as updateDraftRoute,
  DELETE as deleteDraftRoute,
} from '@/app/api/sms/drafts/[id]/route';
import { POST as duplicateDraftRoute } from '@/app/api/sms/drafts/[id]/duplicate/route';
import * as auth from '@/lib/auth/authorization';
import * as draftService from '@/lib/sms/draft-service';

vi.mock('@/lib/auth/authorization');
vi.mock('@/lib/sms/draft-service');

describe('SMS Draft API Endpoints', () => {
  const mockSession = {
    userId: 'user-101',
    user: { id: 'user-101', role: 'CLIENT_ADMIN', email: 'admin@range.ug' },
  };

  const mockTenantContext = {
    userId: 'user-101',
    organizationId: 'org-101',
  };

  const mockDraft = {
    id: 'draft-xyz',
    userId: 'user-101',
    organizationId: 'org-101',
    title: 'Seasonal Promotion',
    senderId: 'RANGESMS',
    deliveryMode: 'manual',
    message: 'Season greetings! Get 15% off.',
    manualRecipients: '+256700111222',
    recipientCount: 1,
    selectedGroupId: null,
    importFilename: null,
    importRowCount: null,
    templateId: null,
    metadata: null,
    version: 1,
    isShared: false,
    lastEditedById: 'user-101',
    lastAutosavedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(auth.requirePermission).mockResolvedValue(
      mockSession as unknown as Awaited<ReturnType<typeof auth.requirePermission>>
    );
    vi.mocked(draftService.resolveUserTenant).mockResolvedValue(mockTenantContext);
  });

  describe('GET /api/sms/drafts', () => {
    it('returns drafts with pagination', async () => {
      vi.mocked(draftService.listSmsDrafts).mockResolvedValue({
        items: [mockDraft as unknown as draftService.SmsDraftWithUser],
        total: 1,
      });

      const req = new Request('http://localhost:3000/api/sms/drafts?limit=10&offset=0');
      const res = await listDraftsRoute(req);
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveLength(1);
      expect(json.pagination.total).toBe(1);
      expect(auth.requirePermission).toHaveBeenCalledWith('sms.send');
    });
  });

  describe('POST /api/sms/drafts', () => {
    it('creates a draft and returns 201', async () => {
      vi.mocked(draftService.createSmsDraft).mockResolvedValue(
        mockDraft as unknown as draftService.SmsDraftWithUser
      );

      const req = new Request('http://localhost:3000/api/sms/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Seasonal Promotion',
          message: 'Season greetings! Get 15% off.',
          manualRecipients: '+256700111222',
        }),
      });

      const res = await createDraftRoute(req);
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.id).toBe('draft-xyz');
      expect(auth.requirePermission).toHaveBeenCalledWith('sms.send');
    });

    it('returns 400 on invalid payload bounds', async () => {
      const req = new Request('http://localhost:3000/api/sms/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'X'.repeat(200), // Exceeds 120 chars
        }),
      });

      const res = await createDraftRoute(req);
      const json = await res.json();

      expect(res.status).toBe(400);
      expect(json.success).toBe(false);
    });
  });

  describe('GET /api/sms/drafts/[id]', () => {
    it('returns single draft by id', async () => {
      vi.mocked(draftService.getSmsDraftById).mockResolvedValue(
        mockDraft as unknown as draftService.SmsDraftWithUser
      );

      const req = new Request('http://localhost:3000/api/sms/drafts/draft-xyz');
      const res = await getDraftRoute(req, { params: Promise.resolve({ id: 'draft-xyz' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.title).toBe('Seasonal Promotion');
    });
  });

  describe('PUT /api/sms/drafts/[id]', () => {
    it('updates draft with optimistic concurrency version', async () => {
      vi.mocked(draftService.updateSmsDraft).mockResolvedValue({
        ...mockDraft,
        version: 2,
        message: 'Updated text',
      } as unknown as draftService.SmsDraftWithUser);

      const req = new Request('http://localhost:3000/api/sms/drafts/draft-xyz', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          version: 1,
          message: 'Updated text',
        }),
      });

      const res = await updateDraftRoute(req, { params: Promise.resolve({ id: 'draft-xyz' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.version).toBe(2);
    });
  });

  describe('POST /api/sms/drafts/[id]/duplicate', () => {
    it('duplicates draft and returns 201', async () => {
      vi.mocked(draftService.duplicateSmsDraft).mockResolvedValue({
        ...mockDraft,
        id: 'draft-xyz-copy',
        title: 'Seasonal Promotion (Copy)',
      } as unknown as draftService.SmsDraftWithUser);

      const req = new Request('http://localhost:3000/api/sms/drafts/draft-xyz/duplicate', {
        method: 'POST',
      });

      const res = await duplicateDraftRoute(req, { params: Promise.resolve({ id: 'draft-xyz' }) });
      const json = await res.json();

      expect(res.status).toBe(201);
      expect(json.success).toBe(true);
      expect(json.data.title).toBe('Seasonal Promotion (Copy)');
    });
  });

  describe('DELETE /api/sms/drafts/[id]', () => {
    it('deletes draft and returns 200', async () => {
      vi.mocked(draftService.deleteSmsDraft).mockResolvedValue({
        success: true,
        id: 'draft-xyz',
      });

      const req = new Request('http://localhost:3000/api/sms/drafts/draft-xyz', {
        method: 'DELETE',
      });

      const res = await deleteDraftRoute(req, { params: Promise.resolve({ id: 'draft-xyz' }) });
      const json = await res.json();

      expect(res.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.message).toContain('deleted');
    });
  });
});
