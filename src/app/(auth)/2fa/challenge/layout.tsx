import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Security Challenge',
  description: 'Complete security verification to continue.',
});

export default function ChallengeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
