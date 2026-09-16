import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TransactionsPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <div className="flex gap-2">
          <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
          <Button variant="outline"><Download className="mr-2 h-4 w-4" /> Export</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Balance After</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-mono text-xs">TXN-90123</TableCell>
                <TableCell>DEPOSIT</TableCell>
                <TableCell className="text-green-600">+UGX 100,000</TableCell>
                <TableCell>UGX 1,250,000</TableCell>
                <TableCell><Badge variant="default">COMPLETED</Badge></TableCell>
                <TableCell>Oct 24, 2026</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-mono text-xs">TXN-90122</TableCell>
                <TableCell>DEDUCTION</TableCell>
                <TableCell className="text-red-600">-UGX 5,000</TableCell>
                <TableCell>UGX 1,150,000</TableCell>
                <TableCell><Badge variant="default">COMPLETED</Badge></TableCell>
                <TableCell>Oct 23, 2026</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
