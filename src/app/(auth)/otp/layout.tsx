import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Verify Code',
  description: 'Enter your verification code to continue.',
});

export default function OtpLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
