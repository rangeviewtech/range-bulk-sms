import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Two-Step Verification',
  description: 'Verify your identity with two-step security.',
});

export default function TwoFactorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
