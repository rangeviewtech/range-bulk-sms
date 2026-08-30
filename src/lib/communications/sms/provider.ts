export interface SmsPayload {
  to: string;
  body: string;
}

export interface SmsProvider {
  name: string;
  send(payload: SmsPayload): Promise<{ success: boolean; messageId?: string; error?: string }>;
  healthCheck(): Promise<boolean>;
}
