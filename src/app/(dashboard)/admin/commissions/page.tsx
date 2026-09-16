import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export default function CommissionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Commissions</h1>
          <p className="text-muted-foreground">Manage agent commissions and payouts.</p>
        </div>
      </div>
      
      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Global Agents LLC</TableCell>
                    <TableCell>Aug 2026</TableCell>
                    <TableCell>$450.00</TableCell>
                    <TableCell><Badge variant="secondary">Pending Approval</Badge></TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="sm">Approve</Button></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="approved" className="mt-4">
          <Card>
            <CardContent className="pt-6"><p className="text-sm text-muted-foreground">No approved commissions.</p></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="paid" className="mt-4">
          <Card>
            <CardContent className="pt-6"><p className="text-sm text-muted-foreground">No paid commissions.</p></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
