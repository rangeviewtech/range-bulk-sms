import { prisma } from '@/lib/prisma';
import { CommunicationChannel } from '@/generated/prisma';

export const NotificationTemplateService = {
  /**
   * Resolves a template and parses the variables inside it using simple {{var}} interpolation
   */
  async resolveTemplate(
    templateName: string,
    channel: CommunicationChannel,
    payload: Record<string, unknown>
  ): Promise<{ subject: string | null; body: string }> {
    // 1. Fetch template from DB
    const template = await prisma.notificationTemplate.findFirst({
      where: { name: templateName, channel, active: true },
    });

    let subjectTemplate = 'Notification';
    let bodyTemplate = 'You have a new message.';

    if (!template) {
      // Fallbacks so we don't break the system before an admin creates templates
      if (templateName === 'auth.login_otp') {
        bodyTemplate = 'Your code is {{otp}}';
        subjectTemplate = 'Your Login Code';
      } else if (templateName === 'auth.password_reset') {
        const resetUrl = new URL(
          '/reset-password',
          process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        );
        resetUrl.searchParams.set('token', String(payload.token ?? ''));
        payload = { ...payload, resetUrl: resetUrl.toString() };
        bodyTemplate = 'Reset your password: {{resetUrl}}';
        subjectTemplate = 'Password Reset';
      } else if (templateName === 'auth.welcome') {
        bodyTemplate = 'Welcome, {{name}}!';
        subjectTemplate = 'Welcome to the platform';
      } else if (templateName === 'auth.new_device') {
        subjectTemplate = 'New sign-in detected';
        bodyTemplate =
          'Hello {{name}}, a new sign-in occurred at {{time}} from {{userAgent}} ({{ipAddress}}).';
      } else {
        throw new Error('Notification template is not configured.');
      }
    } else {
      subjectTemplate = template.subject || subjectTemplate;
      bodyTemplate = template.body;
    }

    // 2. Interpolate {{variables}}
    const interpolate = (text: string, html = false) => {
      return text.replace(/\{\{([^}]+)\}\}/g, (_, key) => {
        const value = Object.hasOwn(payload, key.trim()) ? String(payload[key.trim()] ?? '') : '';
        return html
          ? value.replace(
              /[&<>"']/g,
              (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!
            )
          : value;
      });
    };

    return {
      subject: subjectTemplate ? interpolate(subjectTemplate) : null,
      body: interpolate(bodyTemplate, channel === 'EMAIL' || channel === 'TELEGRAM'),
    };
  },
};
