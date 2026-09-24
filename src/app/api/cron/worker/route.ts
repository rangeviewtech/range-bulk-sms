import { NextRequest, NextResponse } from "next/server";
import { JobWorker } from "@/lib/queue/worker";
import crypto from "crypto";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Background Queue Runner Cron Endpoint
 * Requires timing-safe Bearer token authentication against CRON_SECRET in production.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  // Enforce authentication whenever CRON_SECRET is configured or in production
  if (cronSecret || process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get("authorization");
    const providedSecret = authHeader?.replace(/^Bearer\s+/i, '').trim();

    if (!providedSecret || !cronSecret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized cron execution" },
        { status: 401 }
      );
    }

    // Timing-safe comparison to prevent timing side-channel attacks
    const secretBuffer = Buffer.from(cronSecret);
    const providedBuffer = Buffer.from(providedSecret);

    if (
      secretBuffer.length !== providedBuffer.length ||
      !crypto.timingSafeEqual(secretBuffer, providedBuffer)
    ) {
      return NextResponse.json(
        { success: false, error: "Unauthorized cron execution" },
        { status: 401 }
      );
    }
  }

  try {
    // Process up to 50 jobs per invocation to maintain predictable execution duration
    const results = await JobWorker.processQueue(50);
    
    return NextResponse.json({ 
      success: true, 
      processed: results.length,
      results 
    });
  } catch (error) {
    console.error("[CRON_WORKER_ERROR]", error);
    return NextResponse.json(
      { success: false, error: "Worker encountered an error" },
      { status: 500 }
    );
  }
}
