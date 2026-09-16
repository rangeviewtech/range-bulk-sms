import { NextRequest } from 'next/server';
import { WalletService } from '@/lib/wallet/service';
import { getSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!session.permissions?.includes('wallet.view')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const wallet = await WalletService.getOrCreateWallet({ userId: session.userId });
    const transactions = await WalletService.getTransactions(wallet.id, { page, limit });

    return Response.json({ data: transactions });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
