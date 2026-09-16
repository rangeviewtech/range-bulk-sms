import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsageReportPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">API & System Usage</h1>
      <Card>
        <CardHeader><CardTitle>Daily Request Volume</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center bg-muted/20 border border-dashed rounded-lg">
             <span className="text-muted-foreground">Chart Placeholder (Recharts - LineChart)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
