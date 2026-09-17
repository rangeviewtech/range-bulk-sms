import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifySession } from '@/lib/auth/session';

export async function GET() {
  try {
    const session = await verifySession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const startOfYear = new Date(new Date().getFullYear(), 0, 1);

    const txns = await prisma.transaction.findMany({
      where: {
        userId: session.userId,
        createdAt: { gte: startOfYear },
      },
      select: {
        type: true,
        amount: true,
        createdAt: true,
      },
    });

    let totalDeposits = 0;
    let totalSpend = 0;
    let totalRefunds = 0;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlySpendMap: { [key: string]: { deposits: number; spend: number } } = {};

    // Initialize all months up to current
    const currentMonth = new Date().getMonth();
    for (let i = 0; i <= currentMonth; i++) {
      monthlySpendMap[monthNames[i]] = { deposits: 0, spend: 0 };
    }

    for (const t of txns) {
      const amt = Number(t.amount || 0);
      const mName = monthNames[new Date(t.createdAt).getMonth()];

      if (t.type === 'DEPOSIT') {
        totalDeposits += amt;
        if (monthlySpendMap[mName]) monthlySpendMap[mName].deposits += amt;
      } else if (t.type === 'DEDUCTION') {
        totalSpend += amt;
        if (monthlySpendMap[mName]) monthlySpendMap[mName].spend += amt;
      } else if (t.type === 'REFUND') {
        totalRefunds += amt;
      }
    }

    const monthlyData = Object.entries(monthlySpendMap).map(([month, data]) => ({
      month,
      spend: data.spend,
      deposits: data.deposits,
    }));

    return NextResponse.json({
      summary: {
        totalDeposits,
        totalSpend,
        totalRefunds,
      },
      monthlyData,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
