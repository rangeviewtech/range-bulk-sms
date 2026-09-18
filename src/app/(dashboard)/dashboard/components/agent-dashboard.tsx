import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Coins, BadgeDollarSign, Building2, UserPlus, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AgentDashboard() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Agent Portal</h1>
          <p className="text-sm text-muted-foreground">Manage your clients and track commissions.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/agent/clients/new">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Client
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "My Clients", icon: Building2, value: "24" },
          { title: "Client SMS Volume", icon: FileText, value: "145,200" },
          { title: "Total Commissions", icon: Coins, value: "UGX 450,000" },
          { title: "Pending Payout", icon: BadgeDollarSign, value: "UGX 125,000" },
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
