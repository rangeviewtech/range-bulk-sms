import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Typography - Design System',
  description: 'Type scales, font stacks, and text hierarchy.',
});

export default function TypographyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
