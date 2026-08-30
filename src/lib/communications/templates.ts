// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const SMSTemplates: Record<string, (data: any) => string> = {
  'auth.login_otp': (data) => `Your Master Template login code is: ${data.otp}. Do not share this code.`,
  'auth.security_alert': (data) => `Security Alert: We detected a new login to your Master Template account from ${data.device}.`,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const TelegramTemplates: Record<string, (data: any) => string> = {
  'auth.login_otp': (data) => `🔐 <b>Your verification code is:</b>\n\n<code>${data.otp}</code>\n\nThis code expires in 5 minutes. Do not share it.`,
  'auth.security_alert': (data) => `⚠️ <b>Security Alert</b>\n\nWe detected a new login to your account from ${data.device}.`,
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const EmailTemplates: Record<string, (data: any) => { subject: string, html: string, text: string }> = {
  'auth.password_reset': (data) => ({
    subject: 'Reset your password',
    text: `Reset your password by clicking here: ${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${data.token}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Reset Your Password</h2>
        <p>You requested a password reset. Click the button below to proceed:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${data.token}" style="display: inline-block; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">If you didn't request this, you can safely ignore this email.</p>
      </div>
    `
  }),
  'auth.welcome': (data) => ({
    subject: 'Welcome to Master Template',
    text: `Hi ${data.name}, welcome to our platform!`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Welcome aboard, ${data.name}!</h2>
        <p>We're thrilled to have you here. Let us know if you need anything.</p>
      </div>
    `
  })
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
    // WhatsApp Cloud uses named templates configured in Meta Business Manager.
    // For auth.login_otp, we assume a template named "auth_otp" with 1 parameter.
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
