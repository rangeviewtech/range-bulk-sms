import { NextResponse } from 'next/server';
import { requirePermission } from '@/lib/auth/authorization';
import {
  listSmsDrafts,
  createSmsDraft,
  resolveUserTenant,
} from '@/lib/sms/draft-service';
import {
  createSmsDraftSchema,
  listDraftsQuerySchema,
} from '@/lib/validations/sms-draft';
import { AppError } from '@/lib/errors';

export async function GET(req: Request) {
  try {
    const session = await requirePermission('sms.send');
    const tenantContext = await resolveUserTenant(session.userId);

    const { searchParams } = new URL(req.url);
    const query = listDraftsQuerySchema.parse({
      search: searchParams.get('search') || undefined,
      limit: searchParams.get('limit') || undefined,
      offset: searchParams.get('offset') || undefined,
    });

    const result = await listSmsDrafts(tenantContext, query);

    return NextResponse.json({
      success: true,
      data: result.items,
      pagination: {
        total: result.total,
        limit: query.limit,
        offset: query.offset,
      },
      total: result.total,
    });
  } catch (error) {
    console.error('Error in GET /api/sms/drafts:', error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to retrieve drafts';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission('sms.send');
    const tenantContext = await resolveUserTenant(session.userId);

    const body = await req.json().catch(() => ({}));
    const parsed = createSmsDraftSchema.safeParse(body);

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

    const draft = await createSmsDraft(tenantContext, parsed.data);

    return NextResponse.json(
      {
        success: true,
        data: draft,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error in POST /api/sms/drafts:', error);
    if (error instanceof AppError) {
      return NextResponse.json(
        { success: false, error: error.message, code: error.code },
        { status: error.statusCode }
      );
    }
    const message = error instanceof Error ? error.message : 'Failed to save draft';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
