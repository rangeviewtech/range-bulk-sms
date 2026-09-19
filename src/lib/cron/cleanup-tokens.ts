import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export interface CleanupResult {
  success: boolean;
  deletedCount: number;
  durationMs: number;
  details: {
    verificationTokens: number;
    otpRecords: number;
    telegramTokens: number;
  };
}

/**
 * Enterprise Token Cleanup Service
 * 
 * Safely purges expired verification tokens, OTP codes, and expired temporary tokens
 * in configurable batches to prevent database locking and maintain lean storage.
 */
export async function cleanupExpiredTokens(batchSize: number = 500): Promise<CleanupResult> {
  const startTime = Date.now();
  const workerId = crypto.randomUUID();
  const now = new Date();

  await logger.audit({
    eventName: 'CRON_CLEANUP_STARTED',
    category: 'SYSTEM',
    severity: 'INFO',
    outcome: 'SUCCESS',
    action: 'DELETE',
    description: `Token cleanup worker ${workerId} initiated`,
    metadata: { batchSize, workerId },
  });

  try {
    let totalDeleted = 0;
    let deletedVerification = 0;
    let deletedOtp = 0;
    let deletedTelegram = 0;

    // 1. Clean expired verification tokens in batches
    const expiredTokenIds =
      (await prisma.verificationToken?.findMany({
        where: {
          expiresAt: { lt: now },
        },
        select: { id: true },
        take: batchSize,
      })) || [];

    if (expiredTokenIds.length > 0) {
      const res = await prisma.verificationToken.deleteMany({
        where: {
          id: { in: expiredTokenIds.map((t) => t.id) },
        },
      });
      deletedVerification = res?.count || 0;
      totalDeleted += deletedVerification;
    }

    // 2. Clean expired OTP records in batches
    const expiredOtpIds =
      (await prisma.otpRecord?.findMany({
        where: {
          expiresAt: { lt: now },
        },
        select: { id: true },
        take: batchSize,
      })) || [];

    if (expiredOtpIds.length > 0) {
      const res = await prisma.otpRecord.deleteMany({
        where: {
          id: { in: expiredOtpIds.map((o) => o.id) },
        },
      });
      deletedOtp = res?.count || 0;
      totalDeleted += deletedOtp;
    }

    // 3. Clean expired Telegram linking tokens in batches
    const expiredTelegramIds =
      (await prisma.telegramLinkingToken?.findMany({
        where: {
          expiresAt: { lt: now },
        },
        select: { id: true },
        take: batchSize,
      })) || [];

    if (expiredTelegramIds.length > 0) {
      const res = await prisma.telegramLinkingToken.deleteMany({
        where: {
          id: { in: expiredTelegramIds.map((t) => t.id) },
        },
      });
      deletedTelegram = res?.count || 0;
      totalDeleted += deletedTelegram;
    }

    const durationMs = Date.now() - startTime;

    await logger.audit({
      eventName: 'CRON_CLEANUP_COMPLETED',
      category: 'SYSTEM',
      severity: 'INFO',
      outcome: 'SUCCESS',
      action: 'DELETE',
      durationMs,
      description: `Token cleanup completed: ${totalDeleted} records removed`,
      metadata: {
        totalDeleted,
        deletedVerification,
        deletedOtp,
        deletedTelegram,
        workerId,
      },
    });

    return {
      success: true,
      deletedCount: totalDeleted,
      durationMs,
      details: {
        verificationTokens: deletedVerification,
        otpRecords: deletedOtp,
        telegramTokens: deletedTelegram,
      },
    };
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';

    await logger.audit({
      eventName: 'CRON_CLEANUP_FAILED',
      category: 'SYSTEM',
      severity: 'ERROR',
      outcome: 'FAILURE',
      action: 'DELETE',
      durationMs,
      reasonCode: 'CLEANUP_EXECUTION_ERROR',
      description: `Token cleanup failed: ${errorMsg}`,
      metadata: { errorMsg, workerId },
    });

    throw error;
  }
}

/**
 * Safely purges expired and revoked sessions:
 * - Absolute expiration passed (expiresAt < now)
 * - Idle expiration passed for non-remembered sessions (idleExpiresAt < now)
 * - Revoked sessions older than 7-day retention period (revokedAt < now - 7 days)
 */
export async function cleanupExpiredSessions(batchSize: number = 500): Promise<{ deletedSessions: number }> {
  const now = new Date();
  const retentionThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  try {
    const expiredSessionIds =
      (await prisma.session?.findMany({
        where: {
          OR: [
            { expiresAt: { lt: now } },
            {
              rememberMe: false,
              idleExpiresAt: { not: null, lt: now },
            },
            {
              revokedAt: { not: null, lt: retentionThreshold },
            },
          ],
        },
        select: { id: true },
        take: batchSize,
      })) || [];

    if (expiredSessionIds.length > 0) {
      const res = await prisma.session.deleteMany({
        where: {
          id: { in: expiredSessionIds.map((s) => s.id) },
        },
      });

      await logger.audit({
        eventName: 'CRON_CLEANUP_COMPLETED',
        category: 'SYSTEM',
        severity: 'INFO',
        outcome: 'SUCCESS',
        action: 'DELETE',
        description: `Session cleanup completed: ${res?.count || 0} records removed`,
        metadata: { deletedSessions: res?.count || 0 },
      });

      return { deletedSessions: res?.count || 0 };
    }

    return { deletedSessions: 0 };
  } catch (error) {
    console.error('Failed to cleanup expired sessions:', error);
    return { deletedSessions: 0 };
  }
}
