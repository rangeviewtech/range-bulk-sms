// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SmtpProvider } from '@/lib/providers/smtp';

const mockSendMail = vi.fn().mockResolvedValue({ messageId: '<msg-12345@smtp.gmail.com>' });

vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn().mockReturnValue({
      sendMail: (...args: unknown[]) => mockSendMail(...args),
    }),
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    audit: vi.fn(),
  },
}));

describe('SmtpProvider & Dual HTML/Plaintext Fallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SMTP_HOST = 'smtp.gmail.com';
    process.env.SMTP_PORT = '587';
    process.env.SMTP_SECURE = 'false';
    process.env.SMTP_REQUIRE_TLS = 'true';
    process.env.SMTP_USER = 'rangeviewtech@gmail.com';
    process.env.SMTP_PASS = 'znzxkpcdwywykijt';
    process.env.SMTP_FROM_NAME = 'Range Bulk SMS';
    process.env.SMTP_FROM_EMAIL = 'rangeviewtech@gmail.com';
  });

  it('sends email with HTML and automatically generated plaintext fallback', async () => {
    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head><style>.header { color: red; }</style></head>
      <body>
        <h1>Password Reset Request</h1>
        <p>Click the link to reset your password:</p>
        <a href="https://rangeviewtech.com/reset-password?token=abcdef123456">Reset Password</a>
        <p>&copy; 2026 Range Bulk SMS. All rights reserved.</p>
      </body>
      </html>
    `;

    const result = await SmtpProvider.send(
      'customer@example.com',
      'Reset Your Password',
      htmlBody
    );

    expect(result.success).toBe(true);
    expect(result.messageId).toBe('<msg-12345@smtp.gmail.com>');

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    const mailOptions = mockSendMail.mock.calls[0][0];

    expect(mailOptions.to).toBe('customer@example.com');
    expect(mailOptions.subject).toBe('Reset Your Password');
    expect(mailOptions.from).toBe('"Range Bulk SMS" <rangeviewtech@gmail.com>');
    expect(mailOptions.html).toBe(htmlBody);

    // Verify plaintext generation stripped HTML and extracted link
    expect(mailOptions.text).toBeTruthy();
    expect(mailOptions.text).not.toContain('<style>');
    expect(mailOptions.text).not.toContain('<h1>');
    expect(mailOptions.text).toContain('Password Reset Request');
    expect(mailOptions.text).toContain('Reset Password (https://rangeviewtech.com/reset-password?token=abcdef123456)');
    expect(mailOptions.text).toContain('© 2026 Range Bulk SMS. All rights reserved.');
  });

  it('uses explicit text fallback if provided', async () => {
    const htmlBody = '<p>HTML content</p>';
    const customText = 'Explicit custom plaintext message';

    await SmtpProvider.send(
      'customer@example.com',
      'Test Subject',
      htmlBody,
      customText
    );

    const mailOptions = mockSendMail.mock.calls[0][0];
    expect(mailOptions.text).toBe(customText);
  });
});
