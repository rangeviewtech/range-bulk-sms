import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Coins, BadgeDollarSign, Building2, UserPlus, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { MetricCard } from "@/components/ui/metric-card";

export function AgentDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader
        title="Agent Portal"
        description="Manage your clients and track commissions."
        action={
          <Button asChild className="w-full sm:w-auto bg-primary text-primary-foreground font-bold hover:bg-primary/90">
            <Link href="/agent/clients/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Client
            </Link>
          </Button>
        }
      />

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "My Clients", icon: Building2, value: "24", trend: { value: "3", isPositive: true, label: "this month" } },
          { title: "Client SMS Volume", icon: FileText, value: "145,200", trend: { value: "15%", isPositive: true, label: "vs last month" } },
          { title: "Total Commissions", icon: Coins, value: "UGX 450,000", description: "Accrued earnings" },
          { title: "Pending Payout", icon: BadgeDollarSign, value: "UGX 125,000", description: "Next payout: Friday" },
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
            <CardTitle>Recent Clients</CardTitle>
            <CardDescription>Latest organizations onboarded</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Acme Corp", joined: "2 days ago", volume: "12.4k msgs", status: "Active" },
                { name: "Globex Ltd", joined: "1 week ago", volume: "5.1k msgs", status: "Active" },
                { name: "Initech", joined: "2 weeks ago", volume: "0 msgs", status: "Pending" },
              ].map((client, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{client.name}</p>
                    <p className="text-sm text-muted-foreground">Joined {client.joined}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">{client.volume}</span>
                    <Badge variant={client.status === "Active" ? "default" : "secondary"}>
                      {client.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/agent/clients">View All Clients</Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Commissions</CardTitle>
            <CardDescription>Earnings from client usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { client: "Acme Corp", amount: "UGX 45,000", date: "Today", status: "Approved" },
                { client: "Globex Ltd", amount: "UGX 12,500", date: "Yesterday", status: "Approved" },
                { client: "Acme Corp", amount: "UGX 8,000", date: "3 days ago", status: "Paid" },
              ].map((comm, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">{comm.client}</p>
                    <p className="text-sm text-muted-foreground">{comm.date}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">{comm.amount}</span>
                    <Badge variant={comm.status === "Approved" ? "default" : "outline"}>
                      {comm.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Button asChild variant="outline" className="w-full">
                <Link href="/agent/commissions">View Commission History</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
