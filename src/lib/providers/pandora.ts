import { logger } from '@/lib/logger';

export const PandoraSmsProvider = {
  async send(
    number: string,
    message: string,
    messageType: string = 'non_customised',
    messageCategory: string = 'bulk'
  ) {
    const username = process.env.PANDORA_USERNAME || process.env.PANDORA_SMS_USERNAME || '';
    const password = process.env.PANDORA_PASSWORD || process.env.PANDORA_SMS_PASSWORD || '';
    const sender = process.env.PANDORA_SENDER || process.env.PANDORA_SMS_SENDER_ID || 'MyApp';

    if (!username || !password) throw new Error('Pandora SMS is not configured.');

    const url = new URL('https://www.sms.thepandoranetworks.com/API/send_sms/');
    url.searchParams.append('number', number);
    url.searchParams.append('message', message);
    url.searchParams.append('username', username);
    url.searchParams.append('password', password);
    url.searchParams.append('sender', sender);
    url.searchParams.append('message_type', messageType);
    url.searchParams.append('message_category', messageCategory);

    try {
      const response = await fetch(url.toString(), { signal: AbortSignal.timeout(15_000) });
      const data = await response.json();

      if (response.ok && data.success) {
        return { success: true, messageId: data.message };
      } else {
        logger.error('Pandora SMS Failed', { status: response.status });
        throw new Error(data.error_message || 'Unknown Pandora Error');
      }
    } catch (err: unknown) {
      logger.error('Pandora SMS Exception', {
        error: err instanceof Error ? (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err)) : 'Provider error',
      });
      throw err;
    }
  },
};
