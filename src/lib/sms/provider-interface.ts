export interface SmsSendRequest {
  to: string;
  message: string;
  senderId: string;
  messageId?: string;
  idempotencyKey?: string;
}

export interface SmsSendResponse {
  success: boolean;
  messageId?: string;
  providerMessageId?: string;
  status: 'QUEUED' | 'SENT' | 'FAILED';
  error?: string;
  errorCode?: string;
  cost?: number;
}

export interface SmsBalanceResponse {
  success: boolean;
  balance: number;
  currency?: string;
  error?: string;
}

export interface SmsDeliveryReport {
  providerMessageId: string;
  status: 'DELIVERED' | 'FAILED' | 'EXPIRED' | 'REJECTED';
  deliveredAt?: Date;
  failureReason?: string;
}

export interface ISmsProvider {
  name: string;
  send(request: SmsSendRequest): Promise<SmsSendResponse>;
  sendBulk(requests: SmsSendRequest[]): Promise<SmsSendResponse[]>;
  getBalance(): Promise<SmsBalanceResponse>;
  getDeliveryReport(messageId: string): Promise<SmsDeliveryReport | null>;
  isHealthy(): Promise<boolean>;
}
