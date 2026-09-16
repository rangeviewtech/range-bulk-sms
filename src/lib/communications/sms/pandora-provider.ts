import { SmsProvider, SmsPayload } from './provider';

export class PandoraSmsProvider implements SmsProvider {
  name = 'pandora-sms';

  async send(payload: SmsPayload) {
    try {
      // 1. Ensure body does not exceed 160 characters (per documentation)
      const messageBody = payload.body.substring(0, 160);

      const url = "https://www.sms.thepandoranetworks.com/API/send_sms/";
      
      const params = new URLSearchParams();
      params.append('username', process.env.PANDORA_SMS_USERNAME || '');
      params.append('password', process.env.PANDORA_SMS_PASSWORD || '');
      params.append('sender', process.env.PANDORA_SMS_SENDER_ID || 'Pandora');
      params.append('number', payload.to);
      params.append('message', messageBody);
      params.append('message_type', process.env.PANDORA_SMS_MESSAGE_TYPE || 'non_customised');
      params.append('message_category', process.env.PANDORA_SMS_MESSAGE_CATEGORY || 'bulk');

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
         return { success: false, error: `HTTP ${response.status} ${response.statusText}` };
      }
      
      const result = await response.json();
      
      // Expected Response Structure:
      // Success: {"success": true, "message": "Your success message"}
      // Error: {"success": false, "error_message": "Your success message"}
      
      if (result.success) {
        return { success: true, messageId: result.message };
      } else {
        return { success: false, error: result.error_message || 'Unknown Pandora Error' };
      }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: unknown) {
      return { success: false, error: (e instanceof Error ? (e instanceof Error ? e.message : String(e)) : String(e)) };
    }
  }

  async healthCheck() {
    // A more advanced check could hit a Pandora balance endpoint.
    return !!process.env.PANDORA_SMS_USERNAME && !!process.env.PANDORA_SMS_PASSWORD;
  }
}
