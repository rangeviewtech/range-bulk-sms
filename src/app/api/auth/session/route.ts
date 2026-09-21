import { NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await verifySession();

    if (!session || !session.isAuth || !session.user) {
      return NextResponse.json({
        isAuth: false,
        user: null,
      });
    }

    const roles = Array.isArray(session.user.roles)
      ? session.user.roles.map((r: { role?: { name: string } | string }) =>
          typeof r.role === 'object' && r.role !== null ? r.role.name : String(r.role || '')
        ).filter(Boolean)
      : [];

    return NextResponse.json({
      isAuth: true,
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        roles,
        status: session.user.status,
      },
    });
  } catch (error) {
    console.error('Failed to get session:', error);
    return NextResponse.json(
      { isAuth: false, user: null, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
