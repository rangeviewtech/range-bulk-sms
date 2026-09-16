import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FinancialReportPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Financial Summary</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Deposits (YTD)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">UGX 5,500,000</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Spend (YTD)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">UGX 4,250,000</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Refunds (YTD)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-yellow-600">UGX 15,000</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Monthly Spend</CardTitle></CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center bg-muted/20 border border-dashed rounded-lg">
             <span className="text-muted-foreground">Chart Placeholder (Recharts - BarChart)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
