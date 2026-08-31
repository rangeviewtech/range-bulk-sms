import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Settings',
  description: 'Manage your application preferences and configuration.',
});

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
