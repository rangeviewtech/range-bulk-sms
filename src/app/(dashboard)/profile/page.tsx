import { requireAuth } from '@/lib/auth/session';
import { PageHeader } from '@/components/layout/page-header';

export default async function ProfilePage() {
  const session = await requireAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        heading="Profile"
        description="Manage your personal information."
      />
      
      <div className="bg-card rounded-lg border p-6 space-y-4">
        <div>
          <h3 className="text-lg font-medium">Account Details</h3>
          <p className="text-sm text-muted-foreground">Information about your current session and account.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Name</p>
            <p>{session.user?.name || 'Not provided'}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Email</p>
            <p>{session.user?.email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">User ID</p>
            <p className="text-xs font-mono">{session.userId}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Status</p>
            <p>
              <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Active
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
