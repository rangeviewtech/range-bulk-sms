import OtpClient from './otp-client';
import { AuthLayout } from '@/components/layout/auth-layout';
import Link from 'next/link';

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
            Session expired
          </h3>
          <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '20px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
            Unable to verify your session. Please sign in again to receive a new verification code.
          </p>
          <div className="login-con" style={{ marginTop: '20px' }}>
            <Link href="/login" style={{ textDecoration: 'none' }}>
              <button
                type="button"
                style={{
                  width: '100%',
                  height: '33px',
                  padding: '6px 28px',
                  fontSize: '13px',
                  lineHeight: '19.5px',
                  backgroundColor: '#29A4FF',
                  color: '#ffffff',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: '0',
                  cursor: 'pointer',
                  textAlign: 'center',
                  boxSizing: 'border-box',
                  fontFamily: FONT_STACK,
                  transition: 'background-color 0.2s ease',
                }}
              >
                Return to sign in
              </button>
            </Link>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div style={{ width: '100%', float: 'left' }}>
        <h3 style={{ fontSize: '28px', fontWeight: 500, color: 'hsl(var(--foreground))', marginBottom: '8px', lineHeight: '33.6px', fontFamily: FONT_STACK }}>
          Two-step verification
        </h3>
        <p style={{ fontSize: '13px', color: 'hsl(var(--muted-foreground))', marginBottom: '16px', lineHeight: '19.5px', fontFamily: FONT_STACK }}>
          We sent a 6-digit verification code to your {defaultChannel.toLowerCase()}. Enter it below to sign in.
        </p>
        <OtpClient userId={userId} defaultChannel={defaultChannel} />
      </div>
    </AuthLayout>
  );
}
