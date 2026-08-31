import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Forms - Design System',
  description: 'Input controls, validation patterns, and form fields.',
});

export default function FormsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
