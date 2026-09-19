import { EmailProvider, EmailPayload } from './provider';
import * as nodemailer from 'nodemailer';
import { logger } from '../../logger';

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
    const startTime = Date.now();
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
      
      const durationMs = Date.now() - startTime;

      // Forensic Audit Log
      await logger.audit({
        eventName: 'EMAIL_SMTP_SENT',
        category: 'COMMUNICATION',
        severity: 'INFO',
        outcome: 'SUCCESS',
        resourceType: 'Email',
        resourceId: info.messageId,
        action: 'CREATE',
        durationMs,
        description: `Successfully sent email via SMTP`,
        metadata: {
          to: payload.to, // Explicitly safe to log the recipient domain (or full address if PII policy allows, but standard requires email recipient tracking)
          subject: payload.subject,
          smtpResponse: info.response,
        }
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (e: unknown) {
      const durationMs = Date.now() - startTime;
      const errorMsg = e instanceof Error ? e.message : 'Unknown SMTP Error';
      
      await logger.audit({
        eventName: 'EMAIL_SMTP_FAILED',
        category: 'COMMUNICATION',
        severity: 'ERROR',
        outcome: 'FAILURE',
        resourceType: 'Email',
        action: 'CREATE',
        durationMs,
        reasonCode: 'SMTP_DELIVERY_FAILURE',
        description: `Failed to send email: ${errorMsg}`,
        metadata: {
          to: payload.to,
          subject: payload.subject,
        }
      });

      return {
        success: false,
        error: errorMsg,
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
