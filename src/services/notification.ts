export type NotificationChannel = 'email' | 'sms' | 'push' | 'in-app';

export interface NotificationPayload {
  recipientId: string;
  subject: string;
  body: string;
  data?: Record<string, unknown>;
  channels: NotificationChannel[];
}

export interface INotificationService {
  send(payload: NotificationPayload): Promise<boolean>;
  sendTemplate(recipientId: string, templateId: string, data: Record<string, unknown>, channels: NotificationChannel[]): Promise<boolean>;
  markAsRead(notificationId: string): Promise<boolean>;
  getUnread(userId: string): Promise<unknown[]>;
}

export class NotificationService implements INotificationService {
  async send(payload: NotificationPayload): Promise<boolean> {
    // Implementation would connect to actual providers (SendGrid, Twilio, etc)
    console.log(`Sending notification to ${payload.recipientId} via ${payload.channels.join(', ')}`);
    return true;
  }

  async sendTemplate(recipientId: string, templateId: string, _data: Record<string, unknown>, _channels: NotificationChannel[]): Promise<boolean> {
    console.log(`Sending template ${templateId} to ${recipientId}`);
    return true;
  }

  async markAsRead(_notificationId: string): Promise<boolean> {
    return true;
  }

  async getUnread(_userId: string): Promise<unknown[]> {
    return [];
  }
}
