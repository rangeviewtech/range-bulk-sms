import { NextRequest } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  return withApiKey(req, 'sender_ids.read', async (request, context) => {
    try {
      const senderIds = await prisma.senderId.findMany({
        where: {
          OR: [
            { userId: context.userId },
            { clientId: context.clientId }
          ].filter(Boolean),
          status: 'APPROVED'
        }
      });
      return Response.json({ data: senderIds });
    } catch (error: unknown) {
      return Response.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) }, { status: 500 });
    }
  });
}
