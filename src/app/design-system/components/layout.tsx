import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Components - Design System',
  description: 'Reusable UI components and interactive elements.',
});

export default function ComponentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
