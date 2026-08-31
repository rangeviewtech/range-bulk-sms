import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Feedback - Design System',
  description: 'Alerts, toasts, dialogs, and loading indicators.',
});

export default function FeedbackLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
