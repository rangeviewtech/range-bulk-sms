import { NextRequest } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';
import { ContactService } from '@/lib/contacts/service';

export async function GET(req: NextRequest) {
  return withApiKey(req, 'contacts.read', async (request, context) => {
    try {
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '20');
      
      const userId = context.userId || context.clientId;
      if (!userId) return Response.json({ error: 'No user context' }, { status: 400 });

      const data = await ContactService.findMany(userId, { page, limit });
      return Response.json({ data });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 500 });
    }
  });
}

export async function POST(req: NextRequest) {
  return withApiKey(req, 'contacts.write', async (request, context) => {
    try {
      const userId = context.userId || context.clientId;
      if (!userId) return Response.json({ error: 'No user context' }, { status: 400 });

      const body = await request.json();
      const contact = await ContactService.create(userId, body);
      return Response.json({ data: contact });
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }
  });
}
