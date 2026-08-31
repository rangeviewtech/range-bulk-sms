import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Communication Providers',
  description: 'Configure Twilio, SendGrid, and messaging provider credentials.',
});

export default function CommProvidersLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
