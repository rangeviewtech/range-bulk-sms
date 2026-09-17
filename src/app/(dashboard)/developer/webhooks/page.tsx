import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

export default function WebhooksPage() {
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Webhooks</h1>
        <Button><Plus className="mr-2 h-4 w-4" /> Add Webhook</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Endpoints</CardTitle>
          <CardDescription>Receive real-time delivery reports and inbound SMS.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>https://api.mycompany.com/sms/callback</TableCell>
                <TableCell>sms.delivered, sms.failed</TableCell>
                <TableCell className="text-green-600 dark:text-green-400">Active</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">Edit</Button>
                  <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400">Delete</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
