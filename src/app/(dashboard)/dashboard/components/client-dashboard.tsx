import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Send, Wallet, Activity, Contact, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function ClientDashboard() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Dashboard</h1>
          <p className="text-muted-foreground">Manage your SMS campaigns and contacts.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline">
            <Link href="/wallet">Top Up Wallet</Link>
          </Button>
          <Button asChild>
            <Link href="/sms/send">Send SMS</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Contacts", icon: Users, value: "5,432" },
          { title: "SMS Sent (Month)", icon: Send, value: "12,450" },
          { title: "Wallet Balance", icon: Wallet, value: "UGX 45,000" },
          { title: "Delivery Rate", icon: Activity, value: "99.1%" },
        ].map((kpi, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
              <kpi.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpi.value}</div>
            </CardContent>
          </Card>
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
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
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
