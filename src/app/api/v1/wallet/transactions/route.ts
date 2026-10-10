import { NextRequest } from 'next/server';
import { WalletService } from '@/lib/wallet/service';
import { verifyAuthenticatedSession } from '@/lib/auth/session';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const querySchema = z.object({
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  limit: z.coerce.number().int().min(1).max(500).default(100),
  type: z.enum(['DEPOSIT', 'DEDUCTION', 'REFUND']).optional(),
});

export async function GET(req: NextRequest) {
  try {
    const session = await verifyAuthenticatedSession();
    if (!session || !session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const parsedQuery = querySchema.safeParse({
      page: url.searchParams.get('page') ?? undefined,
      limit: url.searchParams.get('limit') ?? undefined,
      type: url.searchParams.get('type') ?? undefined,
    });
    if (!parsedQuery.success) {
      return Response.json({ error: 'Invalid transaction history query' }, { status: 400 });
    }
    const { page, limit, type } = parsedQuery.data;

    const wallet = await WalletService.getOrCreateWallet({ userId: session.userId });
    const transactions = await WalletService.getTransactions(wallet.id, {
      page,
      limit,
      type,
    });

    return Response.json({ data: transactions });
  } catch (error: unknown) {
    logger.error('Wallet transaction history request failed', { error });
    return Response.json({ error: 'Unable to load transaction history right now' }, { status: 500 });
  }
}
