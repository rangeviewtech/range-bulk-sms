import { NextRequest } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';
import prisma from '@/lib/prisma';

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
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  });
}
