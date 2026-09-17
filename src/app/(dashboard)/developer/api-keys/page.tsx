import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Key } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">API Keys</h1>
        <Button><Plus className="mr-2 h-4 w-4" /> Generate New Key</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active API Keys</CardTitle>
          <CardDescription>Manage your Developer API access keys.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
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
        </CardContent>
      </Card>
    </div>
  );
}
