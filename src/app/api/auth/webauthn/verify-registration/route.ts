import { NextResponse } from 'next/server';
import { getSession } from '@/lib/dal';
import { verifyRegistrationResponse } from '@simplewebauthn/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/auth/session';
import { logAudit } from '@/lib/security/audit';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const cookieStore = await cookies();
    const challengeCookie = cookieStore.get('webauthn_challenge')?.value;

    if (!challengeCookie) {
      return NextResponse.json({ error: 'Challenge not found or expired' }, { status: 400 });
    }

    const expectedChallengePayload = await decrypt(challengeCookie);
    if (!expectedChallengePayload || expectedChallengePayload.userId !== session.userId) {
      return NextResponse.json({ error: 'Invalid challenge' }, { status: 400 });
    }

    const rpID = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost';
    const expectedOrigin = process.env.NODE_ENV === 'production' ? `https://${rpID}` : `http://${rpID}:3000`; // Or your dev URL

    let verification;
    try {
      verification = await verifyRegistrationResponse({
        response: body,
        expectedChallenge: expectedChallengePayload.challenge as string,
        expectedOrigin,
        expectedRPID: rpID,
      });
    } catch (error: unknown) {
      console.error('Verification failed', error);
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Verification failed' }, { status: 400 });
    }

    if (verification.verified && verification.registrationInfo) {
      const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

      await prisma.authenticator.create({
        data: {
          credentialID: Buffer.from(credential.id, 'base64url'),
          credentialPublicKey: credential.publicKey,
          counter: BigInt(credential.counter),
          credentialDeviceType,
          credentialBackedUp,
          userId: session.userId,
          transports: body.response.transports ? body.response.transports.join(',') : null,
        },
      });

      // Clear challenge
      cookieStore.delete('webauthn_challenge');

      await logAudit({
        userId: session.userId,
        action: 'CRUD_CREATE',
        resourceType: 'Authenticator',
        category: 'SECURITY',
      });

      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Error verifying registration:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
