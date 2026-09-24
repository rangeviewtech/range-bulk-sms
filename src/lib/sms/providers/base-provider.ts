export interface SendSmsParams {
  to: string;
  from: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
  provider: string;
}

export interface SmsProviderAdapter {
  providerName: string;
  sendSms(params: SendSmsParams): Promise<SendSmsResult>;
}
