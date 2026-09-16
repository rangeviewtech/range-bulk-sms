import { logger } from '@/lib/logger';

export const WhatsAppProvider = {
  async send(phone: string, templateName: string, templateData: Record<string, unknown> = {}) {
    const token = process.env.WHATSAPP_API_TOKEN || process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
      throw new Error('WhatsApp is not configured.');
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v17.0/${phoneNumberId}/messages`, {
        method: 'POST',
        signal: AbortSignal.timeout(15_000),
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          to: phone,
          type: 'template',
          template: {
            name: templateName,
            language: { code: process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US' },
            components: Array.isArray(templateData.components)
              ? templateData.components
              : typeof templateData.otp === 'string'
                ? [{ type: 'body', parameters: [{ type: 'text', text: templateData.otp }] }]
                : [],
          },
        }),
      });

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error.message || 'WhatsApp API Error');
      }

      return { success: true, messageId: data.messages?.[0]?.id };
    } catch (err: unknown) {
      logger.error('WhatsApp API Error', {
        error: err instanceof Error ? (err instanceof Error ? (err instanceof Error ? err.message : String(err)) : String(err)) : 'Provider error',
      });
      throw err;
    }
  },
};
