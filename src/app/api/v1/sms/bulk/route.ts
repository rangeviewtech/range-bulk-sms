import { NextRequest } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';

export async function POST(req: NextRequest) {
  return withApiKey(req, 'sms.send', async (request, context) => {
    try {
      const body = await request.json();
      return Response.json({
        success: true,
        batchId: 'batch_mock_123',
        count: body.messages?.length || 0,
        status: 'QUEUED'
      });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }
  });
}
