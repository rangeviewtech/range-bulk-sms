import { getDictionary, LanguageCode } from '@/lib/i18n';
import { appConfig } from '@/config/app';

export interface TemplateData {
  otp?: string;
  device?: string;
  locale?: string;
  lang?: string;
  token?: string;
  name?: string;
  code?: string;
  [key: string]: unknown;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

export interface RenderedTemplateResult {
  body?: string;
  subject?: string;
  html?: string;
  text?: string;
  whatsappTemplateName?: string;
  whatsappComponents?: unknown[];
}

export const SMSTemplates: Record<string, (data: TemplateData) => string> = {
  'auth.login_otp': (data) => {
    const lang = (data.locale || data.lang || 'EN') as LanguageCode;
    const t = getDictionary(lang).email;
    return `${appConfig.name}: ${t.otpBody.replace('{otp}', String(data.otp || '')).replace('{app}', appConfig.name)}`;
  },
  'auth.security_alert': (data) => {
    const lang = (data.locale || data.lang || 'EN') as LanguageCode;
    const t = getDictionary(lang).email;
    return `${appConfig.name}: ${t.securityAlertBody.replace('{device}', String(data.device || 'a new device'))}`;
  },
};

export const TelegramTemplates: Record<string, (data: TemplateData) => string> = {
  'auth.login_otp': (data) => {
    const lang = (data.locale || data.lang || 'EN') as LanguageCode;
    const t = getDictionary(lang).email;
    return `🔐 <b>${t.otpSubject}</b>\n\n<code>${data.otp}</code>\n\n${t.otpBody.replace('{otp}', '').trim()}`;
  },
  'auth.security_alert': (data) => {
    const lang = (data.locale || data.lang || 'EN') as LanguageCode;
    const t = getDictionary(lang).email;
    return `⚠️ <b>${t.securityAlertSubject}</b>\n\n${t.securityAlertBody.replace('{device}', String(data.device || 'a new device'))}`;
  },
};

export const EmailTemplates: Record<string, (data: TemplateData) => RenderedEmail> = {
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
            <a href="${resetUrl}" style="display: inline-block; padding: 10px 24px; background: #04648C; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 13px; border-radius: 6px;">${t.passwordResetButton}</a>
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
  'auth.new_device': (data) => {
    const lang = (data.locale || data.lang || 'EN') as LanguageCode;
    const t = getDictionary(lang).email;
    const securityUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/security`;
    const deviceName = data.deviceName || data.userAgent || 'Unrecognized Device';
    const ipAddress = data.ipAddress || 'Unknown IP';
    const timestamp = data.time || new Date().toUTCString();

    return {
      subject: `${t.securityAlertSubject || 'Security Alert: New Device Sign-In Detected'}`,
      text: `Hello ${data.name || 'there'},\n\nA new sign-in was detected on your account.\nDevice: ${deviceName}\nIP Address: ${ipAddress}\nTime: ${timestamp}\n\nIf this was not you, secure your account immediately:\n${securityUrl}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
          <div style="margin-bottom: 16px;">
            <span style="display: inline-block; padding: 4px 10px; background: #eff6ff; color: #04648C; font-size: 11px; font-weight: 700; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Security Notice</span>
          </div>
          <h2 style="font-size: 20px; font-weight: 600; color: #0f172a; margin-bottom: 12px;">${t.securityAlertSubject || 'New Device Sign-In Detected'}</h2>
          <p style="font-size: 14px; color: #475569; line-height: 22px; margin-bottom: 16px;">
            Hello <strong>${data.name || 'there'}</strong>, we noticed a successful sign-in to your Range Bulk SMS account from a device or location we haven't seen before.
          </p>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 14px 16px; margin-bottom: 20px;">
            <table style="width: 100%; font-size: 13px; color: #334155;">
              <tr>
                <td style="padding: 4px 0; font-weight: 600; width: 100px;">Device:</td>
                <td style="padding: 4px 0;">${deviceName}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: 600;">IP Address:</td>
                <td style="padding: 4px 0;">${ipAddress}</td>
              </tr>
              <tr>
                <td style="padding: 4px 0; font-weight: 600;">Timestamp:</td>
                <td style="padding: 4px 0;">${timestamp}</td>
              </tr>
            </table>
          </div>
          <p style="font-size: 13px; color: #64748b; line-height: 20px; margin-bottom: 20px;">
            If this was you, no action is needed. If you did not sign in recently, please review your active sessions and change your password immediately.
          </p>
          <div style="margin-bottom: 24px;">
            <a href="${securityUrl}" style="display: inline-block; padding: 10px 24px; background: #04648C; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 13px; border-radius: 6px;">Manage Security & Sessions</a>
          </div>
        </div>
      `,
    };
  },
  'auth.password_changed': (data) => {
    const securityUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/settings/security`;
    return {
      subject: 'Security Alert: Password Changed Successfully',
      text: `Hello ${data.name || 'there'},\n\nYour account password was changed successfully. If you did not make this change, please contact support immediately.\n\n${securityUrl}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;">
          <h2 style="font-size: 20px; font-weight: 600; color: #0f172a; margin-bottom: 12px;">Password Changed Successfully</h2>
          <p style="font-size: 14px; color: #475569; line-height: 22px; margin-bottom: 16px;">
            Hello <strong>${data.name || 'there'}</strong>, your password for Range Bulk SMS has been successfully updated. All active sessions have been secured.
          </p>
          <p style="font-size: 13px; color: #64748b; line-height: 20px; margin-bottom: 20px;">
            If you did not initiate this change, your account may be compromised. Please contact support immediately or reset your password.
          </p>
          <div style="margin-bottom: 24px;">
            <a href="${securityUrl}" style="display: inline-block; padding: 10px 24px; background: #04648C; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 13px; border-radius: 6px;">Review Security Settings</a>
          </div>
        </div>
      `,
    };
  },
};

export function renderTemplate(
  channel: 'EMAIL' | 'SMS' | 'TELEGRAM' | 'WHATSAPP',
  templateId: string,
  data: TemplateData
): RenderedTemplateResult {
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
