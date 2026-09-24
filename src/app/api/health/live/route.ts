import { NextResponse } from 'next/server';

/**
 * Liveness probe: returns 200 immediately if Next.js process is active.
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
}
