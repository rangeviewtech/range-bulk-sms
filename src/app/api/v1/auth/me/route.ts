import { NextRequest, NextResponse } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  return withApiKey(req, '', async (_request, context) => {
    try {
      if (!context.userId) {
        return NextResponse.json({ success: false, error: 'User context not found' }, { status: 401 });
      }

      const user = await prisma.user.findUnique({
        where: { id: context.userId },
        select: {
          id: true,
          name: true,
          email: true,
          status: true,
          timezone: true,
          phone: true,
          createdAt: true,
          roles: {
            select: {
              role: {
                select: { name: true }
              }
            }
          }
        }
      });

      if (!user) {
        return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        user: {
          ...user,
          roles: user.roles.map((r) => r.role.name)
        }
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Internal Server Error';
      return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
  });
}
