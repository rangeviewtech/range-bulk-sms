import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Send, Wallet, Activity, Contact, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/ui/metric-card";

export function ClientDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader
        title="Client Dashboard"
        description="Manage your SMS campaigns and contacts."
        action={
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href="/wallet">Top Up Wallet</Link>
            </Button>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/sms/send">Send SMS</Link>
            </Button>
          </div>
        }
      />

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Contacts", icon: Users, value: "5,432", trend: { value: "12%", isPositive: true, label: "this month" } },
          { title: "SMS Sent (Month)", icon: Send, value: "12,450", trend: { value: "8.4%", isPositive: true, label: "vs last month" } },
          { title: "Wallet Balance", icon: Wallet, value: "UGX 45,000", description: "~1,285 SMS capacity" },
          { title: "Delivery Rate", icon: Activity, value: "99.1%", trend: { value: "0.4%", isPositive: true } },
        ].map((kpi, i) => (
          <MetricCard
            key={i}
            title={kpi.title}
            icon={kpi.icon}
            value={kpi.value}
            trend={kpi.trend}
            description={kpi.description}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
            <CardDescription>Your latest messaging activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Weekend Promo", status: "Completed", date: "2 days ago", count: 1200 },
                { name: "Flash Sale Alert", status: "Running", date: "Today", count: 4500 },
                { name: "Monthly Newsletter", status: "Draft", date: "Pending", count: 0 },
              ].map((campaign, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{campaign.name}</p>
                    <p className="text-sm text-muted-foreground">{campaign.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{campaign.count} msgs</span>
                    <Badge variant={campaign.status === "Running" ? "default" : campaign.status === "Draft" ? "secondary" : "outline"}>
                      {campaign.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Frequently used tools</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Link href="/contacts/import" className="flex flex-col items-center justify-center gap-2 rounded-lg border p-6 hover:bg-muted/50 transition-colors">
              <Contact className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">Import Contacts</span>
            </Link>
            <Link href="/reports/sms" className="flex flex-col items-center justify-center gap-2 rounded-lg border p-6 hover:bg-muted/50 transition-colors">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-sm font-medium">View Reports</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
