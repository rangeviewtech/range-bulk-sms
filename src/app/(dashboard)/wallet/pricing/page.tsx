import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">SMS Pricing</h1>
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search country..." className="pl-8" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Global Coverage Pricing</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Country</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Network</TableHead>
                <TableHead>Price (Per SMS)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Uganda</TableCell>
                <TableCell>+256</TableCell>
                <TableCell>MTN</TableCell>
                <TableCell>UGX 45.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Uganda</TableCell>
                <TableCell>+256</TableCell>
                <TableCell>Airtel</TableCell>
                <TableCell>UGX 45.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Kenya</TableCell>
                <TableCell>+254</TableCell>
                <TableCell>Safaricom</TableCell>
                <TableCell>UGX 60.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
