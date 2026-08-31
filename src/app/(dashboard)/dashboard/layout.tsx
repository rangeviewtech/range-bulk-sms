import { createMetadata } from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Dashboard',
  description: 'Overview of your fleet, telemetry, and tracking activity.',
});

export default function DashboardPageLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
