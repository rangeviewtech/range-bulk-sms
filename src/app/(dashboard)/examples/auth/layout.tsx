import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Auth Examples',
  description: 'Authentication flows and verification examples.',
});

export default function AuthExamplesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
