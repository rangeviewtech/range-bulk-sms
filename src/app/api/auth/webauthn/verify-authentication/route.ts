import { NextResponse } from 'next/server';
import { verifyAuthenticationResponse } from '@simplewebauthn/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decrypt, createSession } from '@/lib/auth/session';
import { getPreauthChallenge, clearPreauthChallenge } from '@/lib/auth/preauth';
import { logAudit } from '@/lib/security/audit';
import { Buffer } from 'buffer'; // Node polyfill usually active, but explicit import handles buffer conversion

export async function POST(req: Request) {
  try {
    const preauth = await getPreauthChallenge();
    if (!preauth || !preauth.userId) {
      return NextResponse.json({ error: 'MFA session expired or invalid' }, { status: 401 });
    }

    const body = await req.json();

    const cookieStore = await cookies();
    const challengeCookie = cookieStore.get('webauthn_auth_challenge')?.value;

    if (!challengeCookie) {
      return NextResponse.json({ error: 'Challenge not found or expired' }, { status: 400 });
    }

    const expectedChallengePayload = await decrypt(challengeCookie);
    if (!expectedChallengePayload || expectedChallengePayload.userId !== preauth.userId) {
      return NextResponse.json({ error: 'Invalid challenge payload' }, { status: 400 });
    }

    // Find the authenticator in the database
    // The credential ID comes back as base64url from the browser, we need to query it.
    // In Prisma, we stored it as Bytes.
    const user = await prisma.user.findUnique({
      where: { id: preauth.userId },
      include: { authenticators: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const authenticator = user.authenticators.find(
      // We must match the raw id from the response with our stored bytes.
      // A safe way is to let simplewebauthn parse it during verification, but we need to supply the credential to the verify function.
      (auth) => {
        // Compare base64 representations
        const storedBase64 = Buffer.from(auth.credentialID).toString('base64url');
        return storedBase64 === body.id;
      }
    );

    if (!authenticator) {
      return NextResponse.json({ error: 'Authenticator is not registered with this site' }, { status: 400 });
    }

    const rpID = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost';
    const expectedOrigin = process.env.NODE_ENV === 'production' ? `https://${rpID}` : `http://${rpID}:3000`; 

    let verification;
    try {
      verification = await verifyAuthenticationResponse({
        response: body,
        expectedChallenge: expectedChallengePayload.challenge as string,
        expectedOrigin,
        expectedRPID: rpID,
        credential: {
          id: Buffer.from(authenticator.credentialID).toString('base64url'),
          publicKey: authenticator.credentialPublicKey,
          counter: Number(authenticator.counter),
          transports: authenticator.transports ? (authenticator.transports.split(',') as AuthenticatorTransport[]) : undefined,
        },
      });
    } catch (error: unknown) {
      console.error('Verification failed', error);
      return NextResponse.json({ error: error instanceof Error ? error.message : 'Verification failed' }, { status: 400 });
    }

    if (verification.verified && verification.authenticationInfo) {
      const { newCounter } = verification.authenticationInfo;

      // Update the authenticator's counter
      await prisma.authenticator.update({
        where: { id: authenticator.id },
        data: { 
          counter: BigInt(newCounter),
          lastUsed: new Date()
        },
      });

      // Clear cookies
      cookieStore.delete('webauthn_auth_challenge');
      await clearPreauthChallenge();

      // Finalize login session
      await createSession(user.id, true, preauth.rememberMe);

      await logAudit({
        userId: user.id,
        action: 'MFA_LOGIN_SUCCESS',
        resourceType: 'Session',
        category: 'SECURITY',
        status: 'SUCCESS',
      });

      return NextResponse.json({ verified: true, redirect: user.screenLockPin ? '/screen-lock' : '/dashboard' });
    } else {
      return NextResponse.json({ error: 'Verification failed' }, { status: 400 });
    }
  } catch (error: unknown) {
    console.error('Error verifying authentication:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
