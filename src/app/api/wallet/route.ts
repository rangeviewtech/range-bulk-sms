import { NextRequest } from 'next/server';
import { WalletService } from '@/lib/wallet/service';
import { verifySession } from '@/lib/auth/session';

export async function GET(_req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const wallet = await WalletService.getOrCreateWallet({ userId: session.userId });
    const balance = await WalletService.getBalance(wallet.id);

    return Response.json({ data: balance });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return Response.json({ error: message }, { status: 500 });
  }
}
