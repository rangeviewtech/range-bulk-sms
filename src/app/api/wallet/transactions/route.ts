import { NextRequest } from 'next/server';
import { WalletService } from '@/lib/wallet/service';
import { verifySession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = Math.min(Math.max(1, parseInt(url.searchParams.get('limit') || '100', 10)), 500);
    const typeParam = url.searchParams.get('type');
    const validTypes = ['DEPOSIT', 'DEDUCTION', 'REFUND'] as const;
    const type = validTypes.includes(typeParam as (typeof validTypes)[number])
      ? (typeParam as (typeof validTypes)[number])
      : undefined;

    const wallet = await WalletService.getOrCreateWallet({ userId: session.userId });
    const transactions = await WalletService.getTransactions(wallet.id, {
      page,
      limit,
      type,
    });

    return Response.json({ data: transactions });
  } catch (error: unknown) {
    return Response.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) }, { status: 500 });
  }
}
