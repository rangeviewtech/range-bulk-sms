import { NextRequest } from 'next/server';
import { WalletService } from '@/lib/wallet/service';
import { verifySession } from '@/lib/auth/session';
import { Prisma } from '@/generated/prisma/client';
const { Decimal } = Prisma;

export async function POST(req: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || !session.userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const amount = new Decimal(body.amount);
    
    const wallet = await WalletService.getOrCreateWallet({ userId: session.userId });
    
    const result = await WalletService.deposit(wallet.id, amount, {
      userId: session.userId,
      description: body.description || 'Manual Deposit',
      idempotencyKey: body.idempotencyKey
    });

    return Response.json({ data: result });
  } catch (error: unknown) {
    return Response.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) }, { status: 500 });
  }
}
