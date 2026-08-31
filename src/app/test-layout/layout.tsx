import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Test Layout',
});

export default function TestLayoutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
