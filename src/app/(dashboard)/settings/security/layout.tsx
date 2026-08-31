import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Security Settings',
  description: 'Manage account security, multi-factor authentication, and screen lock.',
});

export default function SecuritySettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
