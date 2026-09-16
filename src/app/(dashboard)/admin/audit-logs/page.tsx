import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuditLogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground">System audit trail and activities.</p>
        </div>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4 space-y-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search logs..." className="pl-8" />
          </div>
          <Button variant="outline"><Calendar className="mr-2 h-4 w-4" /> Filter Date</Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="text-muted-foreground whitespace-nowrap">2026-09-16 14:32:01</TableCell>
                <TableCell className="font-medium">admin@example.com</TableCell>
                <TableCell>USER_LOGIN</TableCell>
                <TableCell className="text-sm text-muted-foreground">Logged in successfully from 192.168.1.1</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
