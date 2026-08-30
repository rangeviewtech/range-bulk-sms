export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export interface EmailProvider {
  name: string;
  send(payload: EmailPayload): Promise<{ success: boolean; messageId?: string; error?: string }>;
  healthCheck(): Promise<boolean>;
}
