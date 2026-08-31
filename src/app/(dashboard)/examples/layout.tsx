import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Examples',
  description: 'Interactive examples and UI blueprints.',
});

export default function ExamplesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
