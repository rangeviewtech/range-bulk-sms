import { NextRequest } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';

export async function POST(req: NextRequest) {
  return withApiKey(req, 'sms.send', async (request, context) => {
    try {
      const body = await request.json();
      return Response.json({
        success: true,
        messageId: 'msg_mock_123',
        status: 'QUEUED'
      });
    } catch (error: unknown) {
      return Response.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) }, { status: 400 } as any);
    }
  });
}
