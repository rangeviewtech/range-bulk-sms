import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Data Display - Design System',
  description: 'Tables, badges, avatars, and metrics.',
});

export default function DataDisplayLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
