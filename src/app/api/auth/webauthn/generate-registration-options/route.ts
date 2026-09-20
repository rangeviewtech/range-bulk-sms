import { NextResponse } from 'next/server';
import { getSession } from '@/lib/dal';
import { generateRegistrationOptions } from '@simplewebauthn/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { encrypt } from '@/lib/auth/session';

export async function POST() {
  try {
    const session = await getSession();
    if (!session || !session.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { authenticators: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const rpName = 'Range Bulk SMS';
    const rpID = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost';

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(user.id),
      userName: user.email,
      attestationType: 'none',
      excludeCredentials: user.authenticators.map((auth) => ({
        id: Buffer.from(auth.credentialID).toString('base64url'),
        type: 'public-key',
        transports: auth.transports ? (auth.transports.split(',') as AuthenticatorTransport[]) : undefined,
      })),
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
    });

    // Store the challenge in a secure httpOnly cookie (encrypted)
    const challengeData = await encrypt({
      challenge: options.challenge,
      userId: user.id,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 mins
    });

    (await cookies()).set('webauthn_challenge', challengeData, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/api/auth/webauthn',
      maxAge: 300,
    });

    return NextResponse.json(options);
  } catch (error: unknown) {
    console.error('Error generating registration options:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
