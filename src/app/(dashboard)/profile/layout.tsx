import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Profile',
  description: 'Manage your user profile and preferences.',
});

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
