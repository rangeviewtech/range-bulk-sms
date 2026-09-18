import { EmailProvider, EmailPayload } from './provider';
import * as nodemailer from 'nodemailer';

export class SmtpEmailProvider implements EmailProvider {
  name = 'smtp-primary';
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'localhost',
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD,
      },
      // Important to prevent infinite hangs
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });
  }

  async send(payload: EmailPayload) {
    try {
      const defaultFrom = process.env.SMTP_FROM_EMAIL || 'noreply@example.com';
      const defaultFromName = process.env.SMTP_FROM_NAME || 'Master Template';
      
      const fromFormatted = payload.from ? payload.from : `"${defaultFromName}" <${defaultFrom}>`;

      const info = await this.transporter.sendMail({
        from: fromFormatted,
        to: payload.to,
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
        replyTo: payload.replyTo,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (e: unknown) {
      return {
        success: false,
        error: e instanceof Error ? e.message : 'Unknown SMTP Error',
      };
    }
  }

  async healthCheck() {
    try {
      await this.transporter.verify();
      return true;
    } catch {
      return false;
    }
  }
}
