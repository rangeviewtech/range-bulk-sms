import { NextRequest } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  return withApiKey(req, 'sms.status', async (request, context) => {
    try {
      return Response.json({
        success: true,
        messageId: params.id,
        status: 'DELIVERED',
        deliveredAt: new Date().toISOString()
      });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }
  });
}
