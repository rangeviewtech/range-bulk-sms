import { NextRequest } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';

export async function POST(req: NextRequest) {
  return withApiKey(req, 'sms.schedule', async (request, context) => {
    try {
      const body = await request.json();
      return Response.json({
        success: true,
        scheduledId: 'sched_mock_123',
        scheduledAt: body.scheduledAt
      });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }
  });
}
