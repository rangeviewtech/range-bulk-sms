import { PageHeader } from '@/components/layout/page-header';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader heading="Dashboard" description="Welcome back! Here's an overview of your account." />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {['Total Users', 'Revenue', 'Active Projects', 'Completion Rate'].map((stat) => (
          <div key={stat} className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm">
            <h3 className="text-sm font-medium text-muted-foreground">{stat}</h3>
            <div className="text-2xl font-bold mt-2">123</div>
          </div>
        ))}
      </div>
      
      <div className="border rounded-xl p-6 bg-card">
        <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
        <p className="text-muted-foreground">Table component goes here.</p>
      </div>
    </div>
  );
}
