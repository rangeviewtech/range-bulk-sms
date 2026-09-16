import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Register',
  description: 'Create your Range SMS account for bulk SMS and campaigns.',
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
