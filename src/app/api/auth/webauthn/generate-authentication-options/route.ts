import { NextResponse } from 'next/server';
import { generateAuthenticationOptions } from '@simplewebauthn/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { encrypt } from '@/lib/auth/session';
import { getPreauthChallenge } from '@/lib/auth/preauth';

export async function POST() {
  try {
    const preauth = await getPreauthChallenge();
    if (!preauth || !preauth.userId) {
      return NextResponse.json({ error: 'MFA session expired or invalid' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: preauth.userId },
      include: { authenticators: true }
    });

    if (!user || user.authenticators.length === 0) {
      return NextResponse.json({ error: 'No passkeys found for user' }, { status: 404 });
    }

    const rpID = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost';

    const options = await generateAuthenticationOptions({
      rpID,
      allowCredentials: user.authenticators.map(auth => ({
        id: Buffer.from(auth.credentialID).toString('base64url'),
        type: 'public-key',
        transports: auth.transports ? (auth.transports.split(',') as AuthenticatorTransport[]) : undefined,
      })),
      userVerification: 'preferred',
    });

    // Store the challenge in a secure cookie
    const challengeData = await encrypt({
      challenge: options.challenge,
      userId: user.id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    });

    (await cookies()).set('webauthn_auth_challenge', challengeData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth/webauthn',
      maxAge: 300,
    });

    return NextResponse.json(options);
  } catch (error: unknown) {
    console.error('Error generating authentication options:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
