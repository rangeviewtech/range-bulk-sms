import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth/session';
import { hasPermission } from '@/lib/auth/authorization';
import { senderIdActionSchema } from '@/lib/validations/sender-id';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session || !(await hasPermission(session.userId, 'sender_ids.approve'))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  try {
    const body = await req.json();
    const parsed = senderIdActionSchema.parse(body);
    return NextResponse.json({ success: true, id: params.id, data: parsed });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
  }
}
