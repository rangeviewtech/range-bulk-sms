import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/security/audit';

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  const token = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length).trim()
    : '';

  if (!token) {
    return NextResponse.json({ success: false, error: 'Authentication is required.' }, { status: 401 });
  }

  const sessionData = await decrypt(token).catch(() => null);
  if (
    !sessionData ||
    typeof sessionData.sessionId !== 'string' ||
    typeof sessionData.userId !== 'string'
  ) {
    return NextResponse.json({ success: false, error: 'The session is invalid or expired.' }, { status: 401 });
  }

  try {
    const now = new Date();
    const revoked = await prisma.session.updateMany({
      where: {
        id: sessionData.sessionId,
        userId: sessionData.userId,
        revokedAt: null,
      },
      data: {
        revokedAt: now,
        revocationReason: 'MOBILE_LOGOUT',
      },
    });

    if (revoked.count > 0) {
      await logAudit({
        userId: sessionData.userId,
        action: 'SESSION_REVOKED',
        resourceType: 'Session',
        resourceId: sessionData.sessionId,
        category: 'SECURITY',
        metadata: { reason: 'MOBILE_LOGOUT' },
      }).catch(() => {});
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false, error: 'Unable to sign out right now.' }, { status: 500 });
  }
}
