import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function CampaignsReportPage() {
  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold tracking-tight">Campaign Performance</h1>

      <Card>
        <CardHeader>
          <CardTitle>Top Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign Name</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Delivery Rate</TableHead>
                <TableHead>Total Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Black Friday Promo</TableCell>
                <TableCell>15,000</TableCell>
                <TableCell>99.1%</TableCell>
                <TableCell>UGX 750,000</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Holiday Greetings</TableCell>
                <TableCell>8,400</TableCell>
                <TableCell>97.5%</TableCell>
                <TableCell>UGX 420,000</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
