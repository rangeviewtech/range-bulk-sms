export interface WhatsAppPayload {
  to: string;
  templateName: string;
  languageCode?: string;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  components?: any[];
}

export interface WhatsAppProvider {
  name: string;
  send(payload: WhatsAppPayload): Promise<{ success: boolean; messageId?: string; error?: string; status?: string }>;
  healthCheck(): Promise<boolean>;
}

export class MetaWhatsAppProvider implements WhatsAppProvider {
  name = 'whatsapp-meta';

  async send(payload: WhatsAppPayload) {
    try {
      const url = `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
      
      const body = {
        messaging_product: 'whatsapp',
        to: payload.to,
        type: 'template',
        template: {
          name: payload.templateName,
          language: {
            code: payload.languageCode || process.env.WHATSAPP_TEMPLATE_LANGUAGE || 'en_US',
          },
          components: payload.components || [],
        },
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (!response.ok) {
         // Classify permanent vs temporary errors
         const isAuthError = response.status === 401 || response.status === 403;
         return { 
           success: false, 
           error: result.error?.message || `HTTP ${response.status}`,
           status: isAuthError ? 'PERMANENT_FAILURE' : 'TEMPORARY_FAILURE'
         };
      }
      
      return { 
        success: true, 
        messageId: result.messages?.[0]?.id,
        status: 'SUBMITTED' // Webhooks would update this to DELIVERED/READ
      };
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: unknown) {
      return { success: false, error: (e instanceof Error ? (e instanceof Error ? e.message : String(e)) : String(e)), status: 'UNKNOWN' };
    }
  }

  async healthCheck() {
    return !!process.env.WHATSAPP_ACCESS_TOKEN && !!process.env.WHATSAPP_PHONE_NUMBER_ID;
  }
}
