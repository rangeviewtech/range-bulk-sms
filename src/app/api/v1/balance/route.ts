import { NextRequest } from 'next/server';
import { withApiKey } from '@/lib/api-keys/service';
import { WalletService } from '@/lib/wallet/service';

export async function GET(req: NextRequest) {
  return withApiKey(req, 'balance.read', async (request, context) => {
    try {
      if (!context.clientId && !context.userId) {
         return Response.json({ error: 'Context not found' }, { status: 400 } as any);
      }
      const wallet = await WalletService.getOrCreateWallet({ userId: context.userId, clientId: context.clientId });
      const balance = await WalletService.getBalance(wallet.id);
      return Response.json({ data: balance });
    } catch (error: unknown) {
      return Response.json({ error: (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) }, { status: 500 });
    }
  });
}
