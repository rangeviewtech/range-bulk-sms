import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function CommissionsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Commissions</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Commission History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Campaign/Ref</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">COM-001</TableCell>
                <TableCell>Acme Corp</TableCell>
                <TableCell>CAMP-891</TableCell>
                <TableCell>UGX 2,500</TableCell>
                <TableCell><Badge variant="outline">PENDING</Badge></TableCell>
                <TableCell>Oct 24, 2026</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">COM-000</TableCell>
                <TableCell>Globex Inc</TableCell>
                <TableCell>CAMP-880</TableCell>
                <TableCell>UGX 10,000</TableCell>
                <TableCell><Badge variant="default">PAID</Badge></TableCell>
                <TableCell>Oct 20, 2026</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
