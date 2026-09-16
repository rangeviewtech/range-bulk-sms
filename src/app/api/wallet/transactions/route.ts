import { NextRequest } from 'next/server';
import { WalletService } from '@/lib/wallet/service';
import { verifySession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    const wallet = await WalletService.getOrCreateWallet({ userId: session.userId });
    const transactions = await WalletService.getTransactions(wallet.id, { page, limit });

    return Response.json({ data: transactions });
  } catch (error: unknown) {
    return Response.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) }, { status: 500 });
  }
}
