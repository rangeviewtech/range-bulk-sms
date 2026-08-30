import { NextResponse } from 'next/server';
import { processJobsBatch } from '@/lib/jobs/processor';

// Vercel Cron or standard Node cron hits this endpoint
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Pass a unique worker ID for this execution
    const workerId = `cron-worker-${Date.now()}`;
    
    const result = await processJobsBatch(workerId);
    
    return NextResponse.json({
      success: true,
      message: 'Job batch processed',
      ...result,
    });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Job Processor Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
