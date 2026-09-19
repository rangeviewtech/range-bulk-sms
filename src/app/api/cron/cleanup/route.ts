import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { cleanupExpiredTokens, cleanupExpiredSessions } from '@/lib/cron/cleanup-tokens';
import { logger } from '@/lib/logger';

/**
 * @swagger
 * /api/cron/cleanup:
 *   get:
 *     summary: Automatic cleanup of expired tokens and temporary security credentials
 *     description: Purges expired verification tokens, OTPs, and temporary tokens. Requires CRON_SECRET authentication.
 *     tags:
 *       - Cron Jobs
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Cleanup completed successfully
 *       401:
 *         description: Unauthorized (Invalid CRON_SECRET)
 *       500:
 *         description: Server Error
 */
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret || !authHeader) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const expectedHeader = Buffer.from(`Bearer ${cronSecret}`);
    const actualHeader = Buffer.from(authHeader);

    if (
      actualHeader.length !== expectedHeader.length ||
      !crypto.timingSafeEqual(actualHeader, expectedHeader)
    ) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const result = await cleanupExpiredTokens();
    const sessionResult = await cleanupExpiredSessions();

    return NextResponse.json({
      success: true,
      message: 'Cleanup executed successfully',
      ...result,
      sessionDetails: sessionResult,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await logger.error('Cron cleanup route error', { error: errorMsg });

    return NextResponse.json(
      { success: false, error: 'Unable to complete token cleanup.' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  return GET(req);
}
