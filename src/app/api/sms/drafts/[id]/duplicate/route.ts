import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/authorization';
import { duplicateSmsDraft, resolveUserTenant } from '@/lib/sms/draft-service';
import { AppError } from '@/lib/errors';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function POST(req: Request, context: RouteContext) {
  try {
    const session = await requirePermission('sms.send');
    const tenantContext = await resolveUserTenant(session.userId);
    const { id } = await context.params;

    const cloned = await duplicateSmsDraft(tenantContext, id);

    return NextResponse.json(
      {
        success: true,
        data: cloned,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to duplicate draft' },
      { status: 500 }
    );
  }
}
