import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Colors - Design System',
  description: 'Color tokens and theme palettes.',
});

export default function ColorsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
