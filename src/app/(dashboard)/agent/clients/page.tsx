import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function AgentClientsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">My Clients</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client List</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>SMS Sent (All Time)</TableHead>
                <TableHead>Total Revenue</TableHead>
                <TableHead>Commission Earned</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Acme Corp</TableCell>
                <TableCell>Jan 15, 2026</TableCell>
                <TableCell>450,210</TableCell>
                <TableCell>UGX 18,008,400</TableCell>
                <TableCell>UGX 180,084</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Globex Inc</TableCell>
                <TableCell>Mar 22, 2026</TableCell>
                <TableCell>125,000</TableCell>
                <TableCell>UGX 5,000,000</TableCell>
                <TableCell>UGX 50,000</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
