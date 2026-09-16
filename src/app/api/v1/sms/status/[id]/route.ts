import { NextRequest } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return withApiKey(req, 'sms.status', async () => {
    try {
      return Response.json({
        success: true,
        messageId: id,
        status: 'DELIVERED',
        deliveredAt: new Date().toISOString()
      });
    } catch (error: unknown) {
      return Response.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) }, { status: 400 } as any);
    }
  });
}
