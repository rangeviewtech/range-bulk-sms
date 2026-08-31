import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Communication Logs',
  description: 'Audit logs for dispatched SMS, WhatsApp, and Telegram messages.',
});

export default function CommLogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
