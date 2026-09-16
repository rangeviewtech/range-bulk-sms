import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Server, BadgeDollarSign, Activity, Settings2, BarChart2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">Platform overview and system metrics.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { title: "Total Clients", icon: Users, value: "1,245" },
          { title: "Active Agents", icon: Server, value: "48" },
          { title: "SMS Sent Today", icon: Activity, value: "1.4M" },
          { title: "SMS Delivered (%)", icon: BarChart2, value: "98.2%" },
          { title: "Revenue", icon: BadgeDollarSign, value: "$12,450" },
          { title: "API Traffic", icon: Settings2, value: "45req/s" },
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
            <CardTitle>SMS Volume (7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-muted/20 rounded-md border-dashed border-2 m-6">
            <span className="text-muted-foreground">Chart Placeholder (recharts)</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Revenue (7 Days)</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex items-center justify-center bg-muted/20 rounded-md border-dashed border-2 m-6">
            <span className="text-muted-foreground">Chart Placeholder (recharts)</span>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {[1, 2, 3].map((i) => (
                <li key={i} className="flex justify-between items-center text-sm border-b pb-2 last:border-0 last:pb-0">
                  <span>Promo Campaign {i}</span>
                  <Badge variant="secondary">Running</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="text-sm border-b pb-2">Provider Pandora lag detected</li>
              <li className="text-sm">High Queue Volume on Route 2</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
