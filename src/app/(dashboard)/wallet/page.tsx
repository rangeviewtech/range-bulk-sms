import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function WalletPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Wallet Overview</h1>
        <Button><Plus className="mr-2 h-4 w-4" /> Deposit Funds</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">UGX 1,250,000</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Credits (Est)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">~ 25,000</div>
            <p className="text-xs text-muted-foreground">Based on UGX 50 per SMS</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>Your latest wallet activities.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell><span className="flex items-center text-green-600"><ArrowDownRight className="mr-1 h-4 w-4"/> Deposit</span></TableCell>
                <TableCell>UGX 500,000</TableCell>
                <TableCell>Oct 24, 2026</TableCell>
                <TableCell>TXN-123456</TableCell>
              </TableRow>
              <TableRow>
                <TableCell><span className="flex items-center text-red-600"><ArrowUpRight className="mr-1 h-4 w-4"/> Deduction</span></TableCell>
                <TableCell>UGX 15,000</TableCell>
                <TableCell>Oct 23, 2026</TableCell>
                <TableCell>CAMP-9981</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
