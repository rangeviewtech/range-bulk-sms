import { getDictionary, LanguageCode } from '@/lib/i18n';
import { appConfig } from '@/config/app';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SMSTemplates: Record<string, (data: any) => string> = {
  'auth.login_otp': (data) => {
    const lang = (data.locale || data.lang || 'EN') as LanguageCode;
    const t = getDictionary(lang).email;
    return `${appConfig.name}: ${t.otpBody.replace('{otp}', data.otp).replace('{app}', appConfig.name)}`;
  },
  'auth.security_alert': (data) => {
    const lang = (data.locale || data.lang || 'EN') as LanguageCode;
    const t = getDictionary(lang).email;
    return `${appConfig.name}: ${t.securityAlertBody.replace('{device}', data.device || 'a new device')}`;
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TelegramTemplates: Record<string, (data: any) => string> = {
  'auth.login_otp': (data) => {
    const lang = (data.locale || data.lang || 'EN') as LanguageCode;
    const t = getDictionary(lang).email;
    return `🔐 <b>${t.otpSubject}</b>\n\n<code>${data.otp}</code>\n\n${t.otpBody.replace('{otp}', '').trim()}`;
  },
  'auth.security_alert': (data) => {
    const lang = (data.locale || data.lang || 'EN') as LanguageCode;
    const t = getDictionary(lang).email;
    return `⚠️ <b>${t.securityAlertSubject}</b>\n\n${t.securityAlertBody.replace('{device}', data.device || 'a new device')}`;
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EmailTemplates: Record<string, (data: any) => { subject: string, html: string, text: string }> = {
  'auth.password_reset': (data) => {
    const lang = (data.locale || data.lang || 'EN') as LanguageCode;
    const t = getDictionary(lang).email;
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${data.token}`;
    return {
      subject: t.passwordResetSubject,
      text: `${t.passwordResetBody}\n\n${resetUrl}\n\n${t.passwordResetDisclaimer}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="font-size: 20px; font-weight: 600; color: #0f172a; margin-bottom: 12px;">${t.passwordResetHeading}</h2>
          <p style="font-size: 14px; color: #475569; line-height: 22px; margin-bottom: 20px;">${t.passwordResetBody}</p>
          <div style="margin-bottom: 24px;">
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 24px; background: #29A4FF; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 13px; border-radius: 6px;">${t.passwordResetButton}</a>
          </div>
          <p style="margin-top: 24px; font-size: 12px; color: #94a3b8; line-height: 18px; border-top: 1px solid #f1f5f9; padding-top: 16px;">${t.passwordResetDisclaimer}</p>
        </div>
      `,
    };
  },
  'auth.welcome': (data) => {
    const lang = (data.locale || data.lang || 'EN') as LanguageCode;
    const t = getDictionary(lang).email;
    return {
      subject: t.welcomeSubject,
      text: `Hi ${data.name},\n\n${t.welcomeBody}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="font-size: 20px; font-weight: 600; color: #0f172a; margin-bottom: 12px;">${t.welcomeHeading.replace('{name}', data.name || 'there')}</h2>
          <p style="font-size: 14px; color: #475569; line-height: 22px;">${t.welcomeBody}</p>
        </div>
      `,
    };
  },
  'auth.login_otp': (data) => {
    const lang = (data.locale || data.lang || 'EN') as LanguageCode;
    const t = getDictionary(lang).email;
    return {
      subject: t.otpSubject,
      text: `${t.otpBody.replace('{otp}', data.otp)}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="font-size: 20px; font-weight: 600; color: #0f172a; margin-bottom: 12px;">${t.otpSubject}</h2>
          <p style="font-size: 14px; color: #475569; line-height: 22px; margin-bottom: 16px;">${t.otpBody.replace('{otp}', '')}</p>
          <div style="display: inline-block; padding: 12px 24px; font-size: 24px; letter-spacing: 4px; font-weight: 700; background: #f1f5f9; color: #0f172a; border-radius: 6px; font-family: monospace;">
            ${data.otp}
          </div>
        </div>
      `,
    };
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function renderTemplate(channel: 'EMAIL' | 'SMS' | 'TELEGRAM' | 'WHATSAPP', templateId: string, data: any): any {
  if (channel === 'SMS') {
    const renderer = SMSTemplates[templateId];
    if (!renderer) throw new Error(`SMS Template ${templateId} not found`);
    return { body: renderer(data) };
  } else if (channel === 'TELEGRAM') {
    const renderer = TelegramTemplates[templateId];
    if (!renderer) throw new Error(`Telegram Template ${templateId} not found`);
    return { body: renderer(data) };
  } else if (channel === 'WHATSAPP') {
    if (templateId === 'auth.login_otp') {
       return {
         whatsappTemplateName: 'auth_otp',
         whatsappComponents: [{ type: 'body', parameters: [{ type: 'text', text: data.otp }] }]
       };
    }
    return { whatsappTemplateName: templateId.replace('.', '_') };
  } else {
    const renderer = EmailTemplates[templateId];
    if (!renderer) throw new Error(`Email Template ${templateId} not found`);
    return renderer(data);
  }
}
