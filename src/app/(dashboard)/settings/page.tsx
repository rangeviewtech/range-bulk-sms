import { requireAuth } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/page-header';

export default async function SettingsPage() {
  await requireAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Settings"
        description="Manage your application preferences."
      />
      
      <div className="bg-card rounded-lg border p-6">
        <p className="text-muted-foreground">Settings configuration will go here.</p>
      </div>
    </div>
  );
}
