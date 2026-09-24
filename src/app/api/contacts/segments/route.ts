import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { AppError } from '@/lib/errors';
import { z } from 'zod';

const createSegmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  rules: z.record(z.string(), z.unknown()), // The DSL AST
});

export async function GET() {
  try {
    const session = await requirePermission('contacts.view');

    const segments = await prisma.contactSegment.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, segments });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requirePermission('contacts.manage');
    const body = await req.json();
    const parsed = createSegmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.format() }, { status: 400 });
    }

    const { name, description, rules } = parsed.data;

    // Validate the rules by trying to compile them
    // (We don't need to save the compiled query, just ensure it doesn't throw)
    try {
      const { SegmentCompiler } = await import('@/lib/contacts/segment-compiler');
      SegmentCompiler.compile(rules as unknown as import('@/lib/contacts/segment-compiler').SegmentGroup, session.userId);
    } catch (compileError: unknown) {
      const msg = compileError instanceof Error ? compileError.message : String(compileError);
      return NextResponse.json({ success: false, error: `Invalid segment rules: ${msg}` }, { status: 400 });
    }

    const segment = await prisma.contactSegment.create({
      data: {
        userId: session.userId,
        name,
        description,
        rules: rules as unknown as import('@/lib/prisma').Prisma.InputJsonValue,
      }
    });

    return NextResponse.json({ success: true, segment });
  } catch (error) {
    console.error("[CREATE_SEGMENT_ERROR]", error);
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
