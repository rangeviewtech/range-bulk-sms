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
        if (channel === 'EMAIL') {
          bodyTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f4f4f5; color: #141B2D; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #04648C; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 40px 30px; text-align: center; }
    .content h2 { font-size: 20px; color: #141B2D; margin-top: 0; margin-bottom: 16px; }
    .content p { font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px; }
    .otp-box { background-color: #f9fafb; border: 1px dashed #d1d5db; border-radius: 8px; padding: 20px; text-align: center; margin: 0 auto 24px auto; max-width: 300px; }
    .otp-code { font-size: 32px; font-weight: 700; color: #141B2D; letter-spacing: 4px; }
    .footer { padding: 20px 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 13px; color: #6b7280; margin: 0 0 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/images/brand/range-logo-dark.png" alt="Range Bulk SMS" style="max-height: 40px; display: inline-block;">
    </div>
    <div class="content">
      <h2>Your Login Code</h2>
      <p>Please use the following verification code to complete your sign-in process. This code will expire in 5 minutes.</p>
      
      <div class="otp-box">
        <div class="otp-code">{{otp}}</div>
      </div>
      
      <p style="font-size: 14px; color: #9ca3af;">If you didn't request this code, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Range Bulk SMS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
        } else {
          bodyTemplate = 'Your code is {{otp}}';
        }
        subjectTemplate = 'Your Login Code';
      } else if (templateName === 'auth.password_reset') {
        const resetUrl = new URL(
          '/reset-password',
          process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
        );
        resetUrl.searchParams.set('token', String(payload.token ?? ''));
        payload = { ...payload, resetUrl: resetUrl.toString() };
        if (channel === 'EMAIL') {
          bodyTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f4f4f5; color: #141B2D; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #04648C; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 40px 30px; text-align: center; }
    .content h2 { font-size: 20px; color: #141B2D; margin-top: 0; margin-bottom: 16px; }
    .content p { font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px; }
    .button { display: inline-block; background-color: #FBCA07; color: #141B2D; text-decoration: none; font-weight: 700; font-size: 16px; padding: 14px 28px; border-radius: 6px; box-shadow: 0 2px 4px rgba(251,202,7,0.3); }
    .footer { padding: 20px 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 13px; color: #6b7280; margin: 0 0 8px 0; }
    .footer a { color: #04648C; text-decoration: none; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/images/brand/range-logo-light.png" alt="Range Bulk SMS" style="max-height: 40px; display: inline-block;">
    </div>
    <div class="content">
      <h2>Password Reset Request</h2>
      <p>We received a request to reset your password. If you didn't make this request, you can safely ignore this email.</p>
      <p>Click the button below to set up a new password for your account:</p>
      <a href="{{resetUrl}}" class="button">Reset Password</a>
      <p style="margin-top: 32px; font-size: 14px; color: #9ca3af;">Or copy and paste this link into your browser:<br><a href="{{resetUrl}}" style="color: #04648C; word-break: break-all;">{{resetUrl}}</a></p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Range Bulk SMS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
        } else {
          bodyTemplate = 'Reset your password: {{resetUrl}}';
        }
        subjectTemplate = 'Password Reset';
      } else if (templateName === 'auth.welcome') {
        if (channel === 'EMAIL') {
          bodyTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f4f4f5; color: #141B2D; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #04648C; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 40px 30px; text-align: center; }
    .content h2 { font-size: 20px; color: #141B2D; margin-top: 0; margin-bottom: 16px; }
    .content p { font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px; }
    .button { display: inline-block; background-color: #FBCA07; color: #141B2D; text-decoration: none; font-weight: 700; font-size: 16px; padding: 14px 28px; border-radius: 6px; box-shadow: 0 2px 4px rgba(251,202,7,0.3); }
    .footer { padding: 20px 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 13px; color: #6b7280; margin: 0 0 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/images/brand/range-logo-dark.png" alt="Range Bulk SMS" style="max-height: 40px; display: inline-block;">
    </div>
    <div class="content">
      <h2>Welcome to Range Bulk SMS, {{name}}!</h2>
      <p>We're thrilled to have you on board. Start sending campaigns, automating customer notifications, and building better relationships today.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="button">Log In Now</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Range Bulk SMS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
        } else {
          bodyTemplate = 'Welcome, {{name}}!';
        }
        subjectTemplate = 'Welcome to the platform';
      } else if (templateName === 'auth.new_device') {
        if (channel === 'EMAIL') {
          bodyTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f4f4f5; color: #141B2D; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #04648C; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 40px 30px; text-align: center; }
    .content h2 { font-size: 20px; color: #141B2D; margin-top: 0; margin-bottom: 16px; }
    .content p { font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px; }
    .alert-box { background-color: #fffbeb; border: 1px solid #fef3c7; padding: 16px; border-radius: 6px; margin-bottom: 24px; text-align: left; }
    .alert-box p { font-size: 14px; margin: 4px 0; color: #92400e; }
    .alert-box strong { color: #b45309; }
    .button { display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 16px; padding: 14px 28px; border-radius: 6px; }
    .footer { padding: 20px 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 13px; color: #6b7280; margin: 0 0 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/images/brand/range-logo-dark.png" alt="Range Bulk SMS" style="max-height: 40px; display: inline-block;">
    </div>
    <div class="content">
      <h2>New Sign-in Detected</h2>
      <p>Hello {{name}}, we noticed a new sign-in to your Range Bulk SMS account from an unrecognized device.</p>
      
      <div class="alert-box">
        <p><strong>Time:</strong> {{time}}</p>
        <p><strong>IP Address:</strong> {{ipAddress}}</p>
        <p><strong>Device/Browser:</strong> {{userAgent}}</p>
      </div>
      
      <p>If this was you, you can safely ignore this email. If you don't recognize this activity, please secure your account immediately by resetting your password.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password" class="button">Secure My Account</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Range Bulk SMS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
        } else {
          bodyTemplate = 'Hello {{name}}, a new sign-in occurred at {{time}} from {{userAgent}} ({{ipAddress}}).';
        }
        subjectTemplate = 'New sign-in detected';
      } else if (templateName === 'auth.password_changed') {
        if (channel === 'EMAIL') {
          bodyTemplate = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; background-color: #f4f4f5; color: #141B2D; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background-color: #04648C; padding: 30px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 40px 30px; text-align: center; }
    .content h2 { font-size: 20px; color: #141B2D; margin-top: 0; margin-bottom: 16px; }
    .content p { font-size: 16px; color: #4b5563; line-height: 1.5; margin-bottom: 24px; }
    .alert-box { background-color: #ecfdf5; border: 1px solid #d1fae5; padding: 16px; border-radius: 6px; margin-bottom: 24px; text-align: left; }
    .alert-box p { font-size: 14px; margin: 4px 0; color: #065f46; }
    .button { display: inline-block; background-color: #FBCA07; color: #141B2D; text-decoration: none; font-weight: 700; font-size: 16px; padding: 14px 28px; border-radius: 6px; box-shadow: 0 2px 4px rgba(251,202,7,0.3); }
    .footer { padding: 20px 30px; background-color: #f9fafb; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer p { font-size: 13px; color: #6b7280; margin: 0 0 8px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/images/brand/range-logo-light.png" alt="Range Bulk SMS" style="max-height: 40px; display: inline-block;">
    </div>
    <div class="content">
      <h2>Password Changed Successfully</h2>
      <p>Hello {{name}},</p>
      
      <div class="alert-box">
        <p>Your password was successfully changed just now.</p>
      </div>
      
      <p>If you made this change, you don't need to do anything else. If you didn't change your password, please secure your account immediately or contact support.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/login" class="button">Sign In</a>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} Range Bulk SMS. All rights reserved.</p>
    </div>
  </div>
</body>
</html>`;
        } else {
          bodyTemplate = 'Your password has been changed successfully. If this wasn\'t you, please secure your account.';
        }
        subjectTemplate = 'Your password was changed';
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
