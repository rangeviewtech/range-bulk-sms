import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ProvidersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SMS Providers</h1>
          <p className="text-muted-foreground">Configure gateways and failover priorities.</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Provider</Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Provider Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Credentials</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Pandora SMS</TableCell>
                <TableCell><Badge variant="outline" className="text-green-600">Connected</Badge></TableCell>
                <TableCell><span className="text-muted-foreground text-sm">Valid</span></TableCell>
                <TableCell>1</TableCell>
                <TableCell className="text-right"><Button variant="ghost" size="sm">Config</Button></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
