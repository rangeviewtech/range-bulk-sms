import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { AppError } from '@/lib/errors';
import { SegmentCompiler, SegmentGroup } from '@/lib/contacts/segment-compiler';

export async function POST(req: Request) {
  try {
    const session = await requirePermission('contacts.view');
    const body = await req.json();

    if (!body.rules) {
      return NextResponse.json({ success: false, error: 'rules are required' }, { status: 400 });
    }

    // 1. Compile the DSL into Prisma Where clause
    let whereClause;
    try {
      whereClause = SegmentCompiler.compile(body.rules as SegmentGroup, session.userId);
    } catch (compileError: unknown) {
      const msg = compileError instanceof Error ? compileError.message : String(compileError);
      return NextResponse.json({ success: false, error: `Invalid segment rules: ${msg}` }, { status: 400 });
    }

    // 2. Evaluate the query to get an estimated count
    const totalCount = await prisma.contact.count({
      where: whereClause
    });

    // 3. Get a small preview sample
    const sample = await prisma.contact.findMany({
      where: whereClause,
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ 
      success: true, 
      evaluation: {
        totalCount,
        sample
      }
    });
  } catch (error) {
    console.error("[EVALUATE_SEGMENT_ERROR]", error);
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
