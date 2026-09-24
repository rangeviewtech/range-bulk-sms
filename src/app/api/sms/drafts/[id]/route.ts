import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/authorization';
import {
  getSmsDraftById,
  updateSmsDraft,
  deleteSmsDraft,
  resolveUserTenant,
} from '@/lib/sms/draft-service';
import { updateSmsDraftSchema } from '@/lib/validations/sms-draft';
import { AppError } from '@/lib/errors';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(req: Request, context: RouteContext) {
  try {
    const session = await requirePermission('sms.send');
    const tenantContext = await resolveUserTenant(session.userId);
    const { id } = await context.params;

    const draft = await getSmsDraftById(tenantContext, id);

    return NextResponse.json({
      success: true,
      data: draft,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve draft' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request, context: RouteContext) {
  try {
    const session = await requirePermission('sms.send');
    const tenantContext = await resolveUserTenant(session.userId);
    const { id } = await context.params;

    const body = await req.json().catch(() => ({}));
    const parsed = updateSmsDraftSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: parsed.error.format(),
        },
        { status: 400 }
      );
    }

    const updated = await updateSmsDraft(tenantContext, id, parsed.data);

    return NextResponse.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          code: error.code,
          details: error.details,
        },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to update draft' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: RouteContext) {
  try {
    const session = await requirePermission('sms.send');
    const tenantContext = await resolveUserTenant(session.userId);
    const { id } = await context.params;

    const result = await deleteSmsDraft(tenantContext, id);

    return NextResponse.json({
      success: true,
      message: 'Draft deleted successfully',
      data: result,
    });
  } catch (error) {
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to delete draft' },
      { status: 500 }
    );
  }
}
