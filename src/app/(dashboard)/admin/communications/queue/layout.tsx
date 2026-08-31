import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Message Queue',
  description: 'Monitor queued and processing communication events.',
});

export default function CommQueueLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
