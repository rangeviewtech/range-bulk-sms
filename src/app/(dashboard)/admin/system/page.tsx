import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
