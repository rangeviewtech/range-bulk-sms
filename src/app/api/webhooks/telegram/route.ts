import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/prisma';

/**
 * @swagger
 * /api/webhooks/telegram:
 *   post:
 *     summary: Telegram Webhook Callback
 *     description: Receives updates from the Telegram Bot API. Handles account linking via `/start <token>`.
 *     tags:
 *       - Webhooks
 *     parameters:
 *       - in: header
 *         name: X-Telegram-Bot-Api-Secret-Token
 *         schema:
 *           type: string
 *         required: false
 *         description: Secret token for webhook verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Telegram Update object
 *     responses:
 *       200:
 *         description: Always returns 200 OK to prevent Telegram from retrying
 *       401:
 *         description: Unauthorized (Invalid Secret Token)
 */
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    // 1. Secret verification (X-Telegram-Bot-Api-Secret-Token)
    const configuredSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (configuredSecret) {
      const secretToken = req.headers.get('x-telegram-bot-api-secret-token');
      if (!secretToken) {
        return NextResponse.json({ error: 'Missing webhook secret token' }, { status: 401 });
      }

      const expected = Buffer.from(configuredSecret);
      const actual = Buffer.from(secretToken);

      if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
        return NextResponse.json({ error: 'Invalid webhook secret token' }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    // 2. We only care about messages
    const message = body.message;
    if (
      !message ||
      typeof message.text !== 'string' ||
      message.chat?.type !== 'private' ||
      !Number.isSafeInteger(message.chat?.id)
    ) {
      return NextResponse.json({ ok: true }); // Always return 200 OK to Telegram so it doesn't retry
    }

    const chatId = message.chat.id.toString();
    const text = message.text.trim();

    // 3. Handle "/start <token>" for linking accounts
    if (text.startsWith('/start ')) {
      const parts = text.split(/\s+/);
      const token = parts[1]?.trim();

      if (!token || token.length < 8 || token.length > 128) {
        await sendTelegramReply(chatId, '❌ Invalid or expired linking token.');
        return NextResponse.json({ ok: true });
      }

      // Find un-used, un-expired token
      const linkingToken = await db.telegramLinkingToken.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!linkingToken) {
        // Token invalid
        await sendTelegramReply(chatId, '❌ Invalid or expired linking token.');
        return NextResponse.json({ ok: true });
      }

      if (linkingToken.used || linkingToken.expiresAt < new Date()) {
        await sendTelegramReply(chatId, '❌ This linking token has expired or already been used.');
        return NextResponse.json({ ok: true });
      }

      // Link the account!
      const linked = await db.$transaction(async (tx) => {
        const claimed = await tx.telegramLinkingToken.updateMany({
          where: { id: linkingToken.id, used: false, expiresAt: { gt: new Date() } },
          data: { used: true },
        });
        if (claimed.count !== 1) return false;
        await tx.user.update({
          where: { id: linkingToken.userId },
          data: { telegramChatId: chatId },
        });
        return true;
      });
      if (!linked) return NextResponse.json({ ok: true });

      await sendTelegramReply(
        chatId,
        `✅ Successfully linked your Telegram account to ${linkingToken.user?.email || 'your account'}! You will now receive security notifications and OTPs here.`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram Webhook Error:', error);
    return NextResponse.json({ ok: true }); // Always 200 to prevent retry loops on bad payloads
  }
}

async function sendTelegramReply(chatId: string, text: string) {
  if (!process.env.TELEGRAM_BOT_TOKEN) return;
  const url = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    signal: AbortSignal.timeout(10_000),
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  }).catch(() => {}); // Fire and forget
}
