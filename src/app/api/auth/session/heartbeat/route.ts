import { NextResponse } from 'next/server';
import { verifySession, recordSessionActivity } from '@/lib/auth/session';

/**
 * Session Heartbeat Endpoint
 * 
 * Invoked by active client browser tabs upon intentional user interactions.
 * Throttled on the server to prevent DB contention.
 * For non-remembered sessions, refreshes the 15-minute idle timeout window.
 * For 30-day persistent sessions, confirms session validity without unnecessary DB updates.
 */
export async function POST() {
  try {
    const session = await verifySession();

    if (!session || !session.isAuth) {
      return NextResponse.json(
        { success: false, error: 'Session expired or invalid' },
        { status: 401 }
      );
    }

    // Persistent 30-day sessions do not need idle extensions
    if (session.rememberMe) {
      return NextResponse.json({
        success: true,
        persistent: true,
        expiresAt: session.expiresAt.toISOString(),
      });
    }

    // Refresh non-remembered idle timeout
    const updated = await recordSessionActivity(session.sessionId);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Session could not be extended (expired or revoked)' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      persistent: false,
      lastActivityAt: new Date().toISOString(),
      idleExpiresAt: session.idleExpiresAt?.toISOString() || null,
    });
  } catch (error) {
    console.error('Session heartbeat error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
