import { prisma } from '@/lib/prisma';
import { AppError, NotFoundError } from '@/lib/errors';
import { CreateSmsDraftInput, UpdateSmsDraftInput } from '@/lib/validations/sms-draft';
import { Prisma } from '@/generated/prisma/client';

export interface DraftContext {
  userId: string;
  organizationId: string | null;
}

export type SmsDraftWithUser = Prisma.SmsDraftGetPayload<{
  include: {
    user: {
      select: {
        id: true;
        name: true;
        email: true;
      };
    };
  };
}>;

/**
 * Resolves the user's organizationId via the Client table if available.
 */
export async function resolveUserTenant(userId: string): Promise<DraftContext> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      client: {
        select: {
          organizationId: true,
        },
      },
    },
  });

  return {
    userId,
    organizationId: user?.client?.organizationId ?? null,
  };
}

/**
 * Builds multi-tenant authorization where clause for drafts.
 * - If tenant (organizationId) exists: scopes to organizationId (allowing personal or shared access).
 * - If standalone user (no organizationId): strictly scopes to userId.
 */
function buildTenantDraftWhere(context: DraftContext, draftId?: string): Prisma.SmsDraftWhereInput {
  const baseWhere: Prisma.SmsDraftWhereInput = {};

  if (draftId) {
    baseWhere.id = draftId;
  }

  if (context.organizationId) {
    baseWhere.organizationId = context.organizationId;
  } else {
    baseWhere.userId = context.userId;
    baseWhere.organizationId = null;
  }

  return baseWhere;
}

/**
 * Derives a human-friendly title if none was explicitly provided.
 */
function deriveDraftTitle(title?: string | null, message?: string | null): string {
  if (title && title.trim().length > 0) {
    return title.trim();
  }
  if (message && message.trim().length > 0) {
    const snippet = message.trim().replace(/\s+/g, ' ');
    return snippet.length > 40 ? `${snippet.slice(0, 37)}...` : snippet;
  }
  return 'Untitled Draft';
}

/**
 * Lists drafts belonging to the authenticated user's tenant or personal account.
 */
export async function listSmsDrafts(
  context: DraftContext,
  options: { search?: string; limit?: number; offset?: number } = {}
) {
  const { search, limit = 50, offset = 0 } = options;
  const where = buildTenantDraftWhere(context);

  if (search && search.trim().length > 0) {
    const s = search.trim();
    where.OR = [
      { title: { contains: s, mode: 'insensitive' } },
      { message: { contains: s, mode: 'insensitive' } },
      { senderId: { contains: s, mode: 'insensitive' } },
      { manualRecipients: { contains: s, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.smsDraft.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      take: Math.min(limit, 100),
      skip: offset,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.smsDraft.count({ where }),
  ]);

  return { items, total };
}

/**
 * Retrieves a single draft by ID with strict tenant boundary enforcement.
 */
export async function getSmsDraftById(context: DraftContext, id: string) {
  const where = buildTenantDraftWhere(context, id);
  const draft = await prisma.smsDraft.findFirst({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!draft) {
    throw new NotFoundError('SMS draft not found or access denied');
  }

  return draft;
}

/**
 * Creates a new Quick SMS draft.
 */
export async function createSmsDraft(context: DraftContext, data: CreateSmsDraftInput) {
  const title = deriveDraftTitle(data.title, data.message);
  const recipientCount = data.recipientCount || (data.manualRecipients ? data.manualRecipients.split(/[\n,]+/).filter(Boolean).length : 0);

  const draft = await prisma.smsDraft.create({
    data: {
      userId: context.userId,
      organizationId: context.organizationId,
      title,
      senderId: data.senderId || null,
      deliveryMode: data.deliveryMode || 'manual',
      message: data.message || '',
      manualRecipients: data.manualRecipients || '',
      recipientCount,
      selectedGroupId: data.selectedGroupId || null,
      importFilename: data.importFilename || null,
      importRowCount: data.importRowCount ?? null,
      templateId: data.templateId || null,
      metadata: (data.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      version: 1,
      isShared: data.isShared ?? false,
      lastEditedById: context.userId,
      lastAutosavedAt: new Date(),
    },
  });

  return draft;
}

/**
 * Updates an existing draft with optimistic concurrency control.
 * Throws 409 Conflict if the client's version does not match the database version.
 */
export async function updateSmsDraft(
  context: DraftContext,
  id: string,
  data: UpdateSmsDraftInput
) {
  // First fetch the draft to check existence, tenant boundary, and concurrency version
  const existing = await getSmsDraftById(context, id);

  if (data.version !== undefined && data.version !== existing.version) {
    throw new AppError(
      'This draft was modified elsewhere. Please reload the latest version to avoid overwriting newer changes.',
      409,
      'CONCURRENCY_CONFLICT',
      {
        serverVersion: existing.version,
        clientVersion: data.version,
        updatedAt: existing.updatedAt,
      }
    );
  }

  const title = data.title !== undefined ? deriveDraftTitle(data.title, data.message ?? existing.message) : undefined;
  let recipientCount = data.recipientCount;
  if (recipientCount === undefined && data.manualRecipients !== undefined) {
    recipientCount = data.manualRecipients.split(/[\n,]+/).filter(Boolean).length;
  }

  const updated = await prisma.smsDraft.update({
    where: { id: existing.id },
    data: {
      title,
      senderId: data.senderId !== undefined ? data.senderId : undefined,
      deliveryMode: data.deliveryMode !== undefined ? data.deliveryMode : undefined,
      message: data.message !== undefined ? data.message : undefined,
      manualRecipients: data.manualRecipients !== undefined ? data.manualRecipients : undefined,
      recipientCount: recipientCount !== undefined ? recipientCount : undefined,
      selectedGroupId: data.selectedGroupId !== undefined ? data.selectedGroupId : undefined,
      importFilename: data.importFilename !== undefined ? data.importFilename : undefined,
      importRowCount: data.importRowCount !== undefined ? data.importRowCount : undefined,
      templateId: data.templateId !== undefined ? data.templateId : undefined,
      metadata: data.metadata !== undefined ? (data.metadata as Prisma.InputJsonValue) : undefined,
      isShared: data.isShared !== undefined ? data.isShared : undefined,
      version: { increment: 1 },
      lastEditedById: context.userId,
      lastAutosavedAt: new Date(),
    },
  });

  return updated;
}

/**
 * Deletes a draft with tenant boundary enforcement.
 */
export async function deleteSmsDraft(context: DraftContext, id: string) {
  const existing = await getSmsDraftById(context, id);

  await prisma.smsDraft.delete({
    where: { id: existing.id },
  });

  return { success: true, id };
}

/**
 * Clones a draft into a new independent draft.
 */
export async function duplicateSmsDraft(context: DraftContext, id: string) {
  const existing = await getSmsDraftById(context, id);

  const duplicateTitle = `${existing.title || 'Untitled Draft'} (Copy)`.slice(0, 120);

  const clone = await prisma.smsDraft.create({
    data: {
      userId: context.userId,
      organizationId: context.organizationId,
      title: duplicateTitle,
      senderId: existing.senderId,
      deliveryMode: existing.deliveryMode,
      message: existing.message,
      manualRecipients: existing.manualRecipients,
      recipientCount: existing.recipientCount,
      selectedGroupId: existing.selectedGroupId,
      importFilename: existing.importFilename,
      importRowCount: existing.importRowCount,
      templateId: existing.templateId,
      metadata: (existing.metadata as Prisma.InputJsonValue) ?? Prisma.JsonNull,
      version: 1,
      isShared: false,
      lastEditedById: context.userId,
      lastAutosavedAt: new Date(),
    },
  });

  return clone;
}

/**
 * Consumes/removes a draft upon confirmed send or schedule.
 * Does not throw error if draft was already removed or invalid.
 */
export async function consumeDraftOnSend(context: DraftContext, draftId?: string | null) {
  if (!draftId) return;

  try {
    const where = buildTenantDraftWhere(context, draftId);
    await prisma.smsDraft.deleteMany({ where });
  } catch (_e) {
    // Non-blocking cleanup
  }
}
