import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'UI Examples',
  description: 'UI component patterns and blueprints.',
});

export default function UIExamplesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
