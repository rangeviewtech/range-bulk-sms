import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from "lucide-react";

export default function SmsReportsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">SMS Analytics</h1>
        <div className="flex gap-2">
          <Button variant="outline"><Calendar className="mr-2 h-4 w-4" /> Last 30 Days</Button>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export Report</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Sent</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">14,231</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Delivered</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">13,998 (98.3%)</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Failed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">233 (1.7%)</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Avg Cost per SMS</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">UGX 45</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Delivery Trends</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center bg-muted/20 border border-dashed rounded-lg">
             <span className="text-muted-foreground">Chart Placeholder (Recharts - AreaChart)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
