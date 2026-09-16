import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Session Locked',
  description: 'Unlock your Range SMS secure session.',
});

export default function ScreenLockLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
