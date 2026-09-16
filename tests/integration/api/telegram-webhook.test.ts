/**
 * @vitest-environment node
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { POST } from '@/app/api/webhooks/telegram/route';
import { NextRequest } from 'next/server';
import { prismaMock } from '../../unit/prismaMock';

vi.mock('@/lib/jobs/db', () => ({
  enqueueJob: vi.fn(),
}));

beforeEach(() => {
  vi.stubEnv('TELEGRAM_WEBHOOK_SECRET', 'webhook-test-secret');
});
afterEach(() => vi.unstubAllEnvs());

describe('Telegram Webhook Route', () => {
  it('handles /start with valid token', async () => {
    prismaMock.telegramLinkingToken.findUnique.mockResolvedValue({
      id: 'token-1',
      token: 'valid-token',
      userId: 'user-123',
      expiresAt: new Date(Date.now() + 100000),
      used: false,
    } as never);

    prismaMock.$transaction.mockImplementation(async (args) => {
      if (Array.isArray(args)) {
        return Promise.all(args);
      }
      return args(prismaMock);
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prismaMock.user.update.mockResolvedValue({ id: 'user-123' } as any);
    prismaMock.telegramLinkingToken.updateMany.mockResolvedValue({ count: 1 });

    const body = {
      message: {
        chat: { id: 987654321, type: 'private' },
        text: '/start valid-token',
      },
    };

    const req = new NextRequest('http://localhost:3000/api/webhooks/telegram', {
      method: 'POST',
      headers: {
        'x-telegram-bot-api-secret-token': process.env.TELEGRAM_WEBHOOK_SECRET || '',
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    // Should have updated the user
    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: 'user-123' },
      data: { telegramChatId: '987654321' },
    });
  });

  it('rejects unverified requests', async () => {
    const req = new NextRequest('http://localhost:3000/api/webhooks/telegram', {
      method: 'POST',
      headers: {
        'x-telegram-bot-api-secret-token': 'wrong-secret',
        'content-type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const originalSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    process.env.TELEGRAM_WEBHOOK_SECRET = 'correct-secret';

    const res = await POST(req);
    expect(res.status).toBe(401);

    process.env.TELEGRAM_WEBHOOK_SECRET = originalSecret;
  });
});
