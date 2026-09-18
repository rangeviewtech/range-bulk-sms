export interface TelegramPayload {
  chatId: string;
  text: string;
}

export interface TelegramProvider {
  name: string;
  send(payload: TelegramPayload): Promise<{ success: boolean; messageId?: string; error?: string; status?: string }>;
  healthCheck(): Promise<boolean>;
}

export class BotApiTelegramProvider implements TelegramProvider {
  name = 'telegram-bot';

  async send(payload: TelegramPayload) {
    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) throw new Error('TELEGRAM_BOT_TOKEN is not configured');

      const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: payload.chatId,
          text: payload.text,
          parse_mode: 'HTML',
        }),
      });

      const result = await response.json();

      if (!result.ok) {
        // e.g., error_code 403 (Forbidden: bot was blocked by the user) -> Permanent
        const isPermanent = result.error_code === 400 || result.error_code === 403;
        return { 
          success: false, 
          error: result.description || 'Unknown Telegram Error',
          status: isPermanent ? 'PERMANENT_FAILURE' : 'TEMPORARY_FAILURE'
        };
      }
      
      return { 
        success: true, 
        messageId: result.result?.message_id?.toString(),
        status: 'DELIVERED' // Telegram bot API is usually synchronous to delivery
      };
    } catch (e: unknown) {
      return { success: false, error: e instanceof Error ? e.message : String(e), status: 'UNKNOWN' };
    }
  }

  async healthCheck() {
    return !!process.env.TELEGRAM_BOT_TOKEN;
  }
}
