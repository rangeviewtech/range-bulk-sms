import { logger } from '@/lib/logger';

export const TelegramProvider = {
  async send(chatId: string, text: string) {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) {
      throw new Error('Telegram is not configured.');
    }

    try {
      const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: 'POST',
        signal: AbortSignal.timeout(15_000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
        }),
      });

      const data = await response.json();
      if (!data.ok) {
        throw new Error(data.description || 'Telegram API Error');
      }

      return { success: true, messageId: String(data.result.message_id) };
    } catch (err: unknown) {
      logger.error('Telegram API Error', {
        error: err instanceof Error ? (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err)) : 'Provider error',
      });
      throw err;
    }
  },
};
