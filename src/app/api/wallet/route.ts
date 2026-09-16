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

    const wallet = await WalletService.getOrCreateWallet({ userId: session.userId });
    const balance = await WalletService.getBalance(wallet.id);

    return Response.json({ data: balance });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
