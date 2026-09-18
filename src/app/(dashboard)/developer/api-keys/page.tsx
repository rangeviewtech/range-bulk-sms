import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">API Keys</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your Developer API access keys and scopes.</p>
        </div>
        <Button className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Generate New Key</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active API Keys</CardTitle>
          <CardDescription>Manage your Developer API access keys.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="w-full">
            <Table className="min-w-[650px]">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Prefix</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Production Key</TableCell>
                <TableCell className="font-mono text-muted-foreground">rsms_a1b2c3d4...</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Badge variant="outline">sms.send</Badge>
                    <Badge variant="outline">balance.read</Badge>
                  </div>
                </TableCell>
                <TableCell>Sep 01, 2026</TableCell>
                <TableCell><Badge variant="default">Active</Badge></TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400">Revoke</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
