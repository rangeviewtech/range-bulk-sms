import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Forgot Password',
  description: 'Reset your Range SMS account password.',
});

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
