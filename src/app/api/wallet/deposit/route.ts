import { NextRequest } from 'next/server';
import { WalletService } from '@/lib/wallet/service';
import { getSession } from '@/lib/auth/session';
import { Decimal } from '@/generated/prisma/runtime/library';

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (!session.permissions?.includes('wallet.manage')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const amount = new Decimal(body.amount);
    
    const wallet = await WalletService.getOrCreateWallet({ userId: session.userId });
    
    const result = await WalletService.deposit(wallet.id, amount, {
      userId: session.userId,
      description: body.description || 'Manual Deposit',
      idempotencyKey: body.idempotencyKey
    });

    return Response.json({ data: result });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
