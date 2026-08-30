import OtpClient from './otp-client';
import { AuthLayout } from '@/components/layout/auth-layout';

const FONT_STACK = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

export default async function OtpPage(props: { searchParams: Promise<{ userId: string, channel: string }> }) {
  const searchParams = await props.searchParams;
  const userId = searchParams.userId;
  const defaultChannel = searchParams.channel || 'SMS';

  if (!userId) {
    return (
      <AuthLayout>
        <div style={{ width: '100%', float: 'left' }}>
          <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--destructive))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
            Missing User ID
          </h3>
          <p style={{ fontSize: '13px', color: 'hsl(var(--foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
            We cannot verify your account because the user ID is missing.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div style={{ width: '100%', float: 'left' }}>
        <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
          Two-Step Verification
        </h3>
        <p style={{ fontSize: '13px', color: 'hsl(var(--foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
          We&apos;ve sent a verification code to your {defaultChannel.toLowerCase()}.
        </p>
        <OtpClient userId={userId} defaultChannel={defaultChannel} />
      </div>
    </AuthLayout>
  );
}
