import { NextResponse } from 'next/server';
import { prisma as db } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // 1. Secret verification (optional but recommended in production)
    // const secretToken = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
    // if (secretToken !== process.env.TELEGRAM_WEBHOOK_SECRET) return NextResponse.json({}, { status: 401 });

    const body = await req.json();

    // 2. We only care about messages
    const message = body.message;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true }); // Always return 200 OK to Telegram so it doesn't retry
    }

    const chatId = message.chat.id.toString();
    const text = message.text.trim();

    // 3. Handle "/start <token>" for linking accounts
    if (text.startsWith('/start ')) {
      const token = text.split(' ')[1];

      // Find un-used, un-expired token
      const linkingToken = await db.telegramLinkingToken.findUnique({
        where: { token },
        include: { user: true }
      });

      if (!linkingToken) {
         // Token invalid
         await sendTelegramReply(chatId, "❌ Invalid or expired linking token.");
         return NextResponse.json({ ok: true });
      }

      if (linkingToken.used || linkingToken.expiresAt < new Date()) {
         await sendTelegramReply(chatId, "❌ This linking token has expired or already been used.");
         return NextResponse.json({ ok: true });
      }

      // Link the account!
      await db.$transaction([
        db.user.update({
          where: { id: linkingToken.userId },
          data: { telegramChatId: chatId }
        }),
        db.telegramLinkingToken.update({
          where: { id: linkingToken.id },
          data: { used: true }
        })
      ]);

      await sendTelegramReply(chatId, `✅ Successfully linked your Telegram account to ${linkingToken.user.email}! You will now receive security notifications and OTPs here.`);
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
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  }).catch(() => {}); // Fire and forget
}
