import { NextRequest } from 'next/server';
import { WalletService } from '@/lib/wallet/service';
import { verifyAuthenticatedSession } from '@/lib/auth/session';
import { logger } from '@/lib/logger';

export async function GET(_req: NextRequest) {
  try {
    const session = await verifyAuthenticatedSession();
    if (!session || !session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const wallet = await WalletService.getOrCreateWallet({ userId: session.userId });
    const balance = await WalletService.getBalance(wallet.id);

    return Response.json({ data: balance });
  } catch (error: unknown) {
    logger.error('Wallet balance request failed', { error });
    return Response.json({ error: 'Unable to load wallet balance right now' }, { status: 500 });
  }
}
