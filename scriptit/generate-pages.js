const fs = require('fs');
const path = require('path');

const pages = [
  {
    path: 'dashboard/page.tsx',
    content: `import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Server, BadgeDollarSign, Activity, Settings2, BarChart2 } from "lucide-react";
// mock recharts UI
import { Badge } from "@/components/ui/badge";

export default function AdminDashboardPage() {
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
`
  },
  {
    path: 'admin/users/page.tsx',
    content: `import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage system users and access.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Add User</Button>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search users..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Admin User</TableCell>
                <TableCell>admin@example.com</TableCell>
                <TableCell><Badge>Admin</Badge></TableCell>
                <TableCell><Badge variant="outline" className="text-green-600">Active</Badge></TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm">Edit</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
`
  },
  {
    path: 'admin/clients/page.tsx',
    content: `import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground">Manage client accounts and balances.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Client</Button>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search clients..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Wallet Balance</TableHead>
                <TableHead>Agent Assigned</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Acme Corp</TableCell>
                <TableCell><Badge variant="outline" className="text-green-600">Active</Badge></TableCell>
                <TableCell>$1,250.00</TableCell>
                <TableCell>John Agent</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm">Manage</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
`
  },
  {
    path: 'admin/agents/page.tsx',
    content: `import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";

export default function AgentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agents</h1>
          <p className="text-muted-foreground">Manage agents and their commissions.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Agent</Button>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search agents..." className="pl-8" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Company Name</TableHead>
                <TableHead>Linked Clients</TableHead>
                <TableHead>Commission Summary</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Global Agents LLC</TableCell>
                <TableCell>14</TableCell>
                <TableCell>$450.00 / month</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm">View</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
`
  },
  {
    path: 'admin/providers/page.tsx',
    content: `import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProvidersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Providers</h1>
          <p className="text-muted-foreground">Configure gateways and failover priorities.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Provider</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Credentials</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Pandora SMS</TableCell>
                <TableCell><Badge variant="outline" className="text-green-600">Connected</Badge></TableCell>
                <TableCell><span className="text-muted-foreground text-sm">Valid</span></TableCell>
                <TableCell>1</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm">Config</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
`
  },
  {
    path: 'admin/pricing/page.tsx',
    content: `import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pricing Config</h1>
          <p className="text-muted-foreground">Manage country/network rates and overrides.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Rule</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country / Network</TableHead>
                <TableHead>Base Rate</TableHead>
                <TableHead>Client Overrides</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">US / All</TableCell>
                <TableCell>$0.0100</TableCell>
                <TableCell>3 active</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm">Edit</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
`
  },
  {
    path: 'admin/sender-ids/page.tsx',
    content: `import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function SenderIdsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sender ID Approvals</h1>
          <p className="text-muted-foreground">Review and approve Sender IDs.</p>
        </div>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sender ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Requested Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">ACMEMSG</TableCell>
                <TableCell>Acme Corp</TableCell>
                <TableCell><Badge variant="secondary">Pending</Badge></TableCell>
                <TableCell>2026-09-15</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" className="text-green-600">Approve</Button>
                    <Button variant="outline" size="sm" className="text-red-600">Reject</Button>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
`
  },
  {
    path: 'admin/commissions/page.tsx',
    content: `import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function CommissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commissions</h1>
          <p className="text-muted-foreground">Manage agent commissions and payouts.</p>
        </div>
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Global Agents LLC</TableCell>
                    <TableCell>Aug 2026</TableCell>
                    <TableCell>$450.00</TableCell>
                    <TableCell><Badge variant="secondary">Pending Approval</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="sm">Approve</Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="approved" className="mt-4">
          <Card>
            <CardContent className="pt-6"><p className="text-sm text-muted-foreground">No approved commissions.</p></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="paid" className="mt-4">
          <Card>
            <CardContent className="pt-6"><p className="text-sm text-muted-foreground">No paid commissions.</p></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
`
  },
  {
    path: 'admin/audit-logs/page.tsx',
    content: `import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">System audit trail and activities.</p>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search logs..." className="pl-8" />
          </div>
          <Button variant="outline"><Calendar className="mr-2 h-4 w-4" /> Filter Date</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-muted-foreground whitespace-nowrap">2026-09-16 14:32:01</TableCell>
                <TableCell className="font-medium">admin@example.com</TableCell>
                <TableCell>USER_LOGIN</TableCell>
                <TableCell className="text-sm text-muted-foreground">Logged in successfully from 192.168.1.1</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
`
  },
  {
    path: 'admin/system/page.tsx',
    content: `import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Server, ArrowRightLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SystemPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitor</h1>
          <p className="text-muted-foreground">Real-time health and metrics.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Provider Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">All Systems Go</div>
            <p className="text-xs text-muted-foreground mt-1">3/3 providers online</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Queue Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground mt-1">Messages pending in queue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">API Traffic</CardTitle>
            <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 req/s</div>
            <p className="text-xs text-muted-foreground mt-1">Average over last 5 mins</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Provider Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">Pandora SMS</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">34ms latency</span>
                <Badge variant="outline" className="text-green-600">Operational</Badge>
              </div>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">InfoBip</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">120ms latency</span>
                <Badge variant="outline" className="text-green-600">Operational</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
`
  }
];

const basePath = path.join(process.cwd(), 'src/app/(dashboard)');

pages.forEach(page => {
  const fullPath = path.join(basePath, page.path);
  const dir = path.dirname(fullPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(fullPath, page.content);
  console.log('Created:', fullPath);
});
