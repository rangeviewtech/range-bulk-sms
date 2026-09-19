import { NextResponse } from 'next/server';
import { processJobsBatch } from '@/lib/jobs/processor';
import { CronScheduler } from '@/lib/cron/scheduler';
import crypto from 'crypto';
import { logger } from '@/lib/logger';

/**
 * @swagger
 * /api/cron/process-jobs:
 *   get:
 *     summary: Process a batch of queued background jobs
 *     description: Triggers the background job processor to run pending jobs in the queue. Requires CRON_SECRET authentication.
 *     tags:
 *       - Cron Jobs
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully processed jobs
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

    const startTime = Date.now();
    await logger.audit({
      eventName: 'CRON_SCHEDULER_START',
      category: 'SYSTEM',
      severity: 'INFO',
      outcome: 'SUCCESS',
      action: 'UPDATE',
      description: 'Starting background job batch execution'
    });

    // 1. Evaluate Scheduled Jobs
    const scheduledQueued = await CronScheduler.tick();

    // 2. Process pending jobs
    const processedCount = await processJobsBatch(50);
    
    await logger.audit({
      eventName: 'CRON_SCHEDULER_STOP',
      category: 'SYSTEM',
      severity: 'INFO',
      outcome: 'SUCCESS',
      action: 'UPDATE',
      durationMs: Date.now() - startTime,
      description: `Completed job execution`,
      metadata: { scheduledQueued, processedCount }
    });

    return NextResponse.json({
      success: true,
      message: 'Job batch processed',
      scheduledQueued,
      processedCount,
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await logger.audit({
      eventName: 'CRON_SCHEDULER_FAILED',
      category: 'SYSTEM',
      severity: 'ERROR',
      outcome: 'FAILURE',
      action: 'UPDATE',
      reasonCode: 'CRON_EXECUTION_ERROR',
      description: `Job batch execution failed: ${errorMsg}`
    });
    
    return NextResponse.json(
      { success: false, error: 'Unable to process job batch.' },
      { status: 500 }
    );
  }
}
