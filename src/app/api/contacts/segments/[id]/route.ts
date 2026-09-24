import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requirePermission } from '@/lib/auth/authorization';
import { AppError } from '@/lib/errors';
import { z } from 'zod';
import { SegmentCompiler } from '@/lib/contacts/segment-compiler';

const updateSegmentSchema = z.object({
  name: z.string().min(1, "Name is required").optional(),
  description: z.string().optional(),
  rules: z.record(z.string(), z.unknown()).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('contacts.view');
    const { id } = await params;

    const segment = await prisma.contactSegment.findUnique({
      where: { id }
    });

    if (!segment || segment.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Segment not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, segment });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('contacts.manage');
    const { id } = await params;
    
    const segment = await prisma.contactSegment.findUnique({
      where: { id }
    });

    if (!segment || segment.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Segment not found' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateSegmentSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: parsed.error.format() }, { status: 400 });
    }

    const { name, description, rules } = parsed.data;

    if (rules) {
      try {
        SegmentCompiler.compile(rules as unknown as import('@/lib/contacts/segment-compiler').SegmentGroup, session.userId);
      } catch (compileError: unknown) {
        const msg = compileError instanceof Error ? compileError.message : String(compileError);
        return NextResponse.json({ success: false, error: `Invalid segment rules: ${msg}` }, { status: 400 });
      }
    }

    const updated = await prisma.contactSegment.update({
      where: { id },
      data: {
        name: name ?? undefined,
        description: description ?? undefined,
        rules: rules ? (rules as unknown as import('@/lib/prisma').Prisma.InputJsonValue) : undefined,
      }
    });

    return NextResponse.json({ success: true, segment: updated });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requirePermission('contacts.manage');
    const { id } = await params;

    const segment = await prisma.contactSegment.findUnique({
      where: { id }
    });

    if (!segment || segment.userId !== session.userId) {
      return NextResponse.json({ success: false, error: 'Segment not found' }, { status: 404 });
    }

    await prisma.contactSegment.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const status = error instanceof AppError ? error.statusCode : 500;
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
