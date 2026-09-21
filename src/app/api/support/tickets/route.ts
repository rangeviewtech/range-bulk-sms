import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { TicketPriority, TicketStatus } from '@/generated/prisma/client';
import { createTicketSchema } from '@/lib/validations/sender-id';

export async function GET(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = session.user.roles?.some((ur) => ur.role?.name === 'ADMIN');
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status');

    const whereClause: {
      userId?: string;
      status?: TicketStatus;
    } = {};

    if (!isAdmin) {
      whereClause.userId = session.userId;
    }

    if (statusParam && Object.values(TicketStatus).includes(statusParam as TicketStatus)) {
      whereClause.status = statusParam as TicketStatus;
    }

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ tickets });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = createTicketSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || 'Validation failed', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { subject, category, priority, message } = parsed.data;
    const validPriority = priority as TicketPriority;

    const ticket = await prisma.$transaction(async (tx) => {
      const newTicket = await tx.supportTicket.create({
        data: {
          userId: session.userId,
          subject: subject.trim(),
          category: category.trim(),
          priority: validPriority,
          status: TicketStatus.OPEN,
        },
      });

      await tx.ticketMessage.create({
        data: {
          ticketId: newTicket.id,
          userId: session.userId,
          message: message.trim(),
          isAdminResponse: false,
        },
      });

      return newTicket;
    });

    return NextResponse.json({ success: true, ticket });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
