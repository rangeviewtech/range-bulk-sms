import { NextRequest, NextResponse } from 'next/server';
import { WalletService } from '@/lib/wallet/service';
import { requirePermission } from '@/lib/auth/authorization';
import { depositSchema } from '@/lib/validations/wallet';
import { logAudit } from '@/lib/security/audit';
import { AppError } from '@/lib/errors';
import { Prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Only users with explicit wallet management permission (e.g., ADMIN) can directly credit funds
    const session = await requirePermission('wallet.manage');

    const body = await req.json().catch(() => ({}));
    const parsed = depositSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid deposit request', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { amount, paymentMethod, paymentRef, description } = parsed.data;
    const decimalAmount = new Prisma.Decimal(amount);
    
    const wallet = await WalletService.getOrCreateWallet({ userId: session.userId });
    
    const result = await WalletService.deposit(wallet.id, decimalAmount, {
      userId: session.userId,
      paymentMethod,
      paymentRef,
      description: description || `Direct deposit via ${paymentMethod}`,
      idempotencyKey: paymentRef ? `dep-${paymentRef}` : undefined,
    });

    await logAudit({
      action: 'ADMIN_ACTION',
      userId: session.userId,
      category: 'APPLICATION',
      operation: 'CREATE',
      resourceType: 'Wallet',
      resourceId: wallet.id,

      metadata: {
        amount,
        paymentMethod,
        paymentRef,
        transactionRef: result.transactionRef,
      },
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    if (error instanceof AppError) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode });
    }
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

