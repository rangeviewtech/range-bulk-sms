import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';
import { ticketReplySchema } from '@/lib/validations/settings';

export async function POST(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const body = await req.json().catch(() => ({}));
    const parsed = ticketReplySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.errors[0]?.message || 'Invalid reply message',
          details: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { message } = parsed.data;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    const isAdmin = session.user.roles?.some((ur) => ur.role?.name === 'ADMIN');
    if (!isAdmin && ticket.userId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [newMessage] = await prisma.$transaction([
      prisma.ticketMessage.create({
        data: {
          ticketId: id,
          userId: session.userId,
          message: message.trim(),
          isAdminResponse: isAdmin,
        },
      }),
      prisma.supportTicket.update({
        where: { id },
        data: {
          updatedAt: new Date(),
          status: isAdmin ? 'IN_PROGRESS' : ticket.status === 'RESOLVED' ? 'OPEN' : ticket.status,
        },
      }),
    ]);

    return NextResponse.json({ success: true, message: newMessage });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
