import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Reset Password',
  description: 'Set a new password for your Range SMS account.',
});

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
