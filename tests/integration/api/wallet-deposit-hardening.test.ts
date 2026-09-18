/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST as depositRoute } from '@/app/api/wallet/deposit/route';
import { NextRequest } from 'next/server';
import { AppError } from '@/lib/errors';

vi.mock('@/lib/auth/authorization', () => ({
  requirePermission: vi.fn(),
}));

vi.mock('@/lib/wallet/service', () => ({
  WalletService: {
    getOrCreateWallet: vi.fn().mockResolvedValue({ id: 'wallet-test-1' }),
    deposit: vi.fn().mockResolvedValue({
      success: true,
      walletId: 'wallet-test-1',
      balanceBefore: 0,
      balanceAfter: 100000,
      transactionRef: 'DEP_TEST_REF',
    }),
  },
}));

vi.mock('@/lib/security/audit', () => ({
  logAudit: vi.fn().mockResolvedValue(undefined),
}));

import { requirePermission } from '@/lib/auth/authorization';

describe('Wallet Deposit Security Hardening (/api/wallet/deposit)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects unprivileged users with 403 Forbidden', async () => {
    vi.mocked(requirePermission).mockRejectedValueOnce(
      new AppError('Forbidden: Insufficient permissions', 403, 'FORBIDDEN')
    );

    const req = new NextRequest('http://localhost:3000/api/wallet/deposit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ amount: 50000, paymentMethod: 'mobile_money' }),
    });

    const res = await depositRoute(req);
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.error).toContain('Forbidden');
  });

  it('rejects invalid deposit payload with 400 Bad Request', async () => {
    vi.mocked(requirePermission).mockResolvedValueOnce({
      userId: 'admin-user-1',
      sessionId: 'sess-1',
    } as never);

    const req = new NextRequest('http://localhost:3000/api/wallet/deposit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ amount: -500, paymentMethod: 'invalid_method' }),
    });

    const res = await depositRoute(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('Invalid deposit request');
  });

  it('allows authorized admin to credit wallet with valid schema and audit log', async () => {
    vi.mocked(requirePermission).mockResolvedValueOnce({
      userId: 'admin-user-1',
      sessionId: 'sess-1',
    } as never);

    const req = new NextRequest('http://localhost:3000/api/wallet/deposit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        amount: 100000,
        paymentMethod: 'bank_transfer',
        paymentRef: 'WIRE_REF_123',
        description: 'Authorized Admin Top-up',
      }),
    });

    const res = await depositRoute(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.data.transactionRef).toBe('DEP_TEST_REF');
  });
});
