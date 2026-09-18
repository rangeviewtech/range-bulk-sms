import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus } from "lucide-react";

export default function WebhooksPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Webhooks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Receive real-time delivery reports and inbound SMS.</p>
        </div>
        <Button className="w-full sm:w-auto"><Plus className="mr-2 h-4 w-4" /> Add Webhook</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Configured Endpoints</CardTitle>
          <CardDescription>Receive real-time delivery reports and inbound SMS.</CardDescription>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="w-full">
            <Table className="min-w-[550px]">
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
                  <TableCell className="font-mono text-xs break-all">https://api.mycompany.com/sms/callback</TableCell>
                  <TableCell>sms.delivered, sms.failed</TableCell>
                  <TableCell className="text-green-600 dark:text-green-400">Active</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="ghost" size="sm" className="text-red-600 dark:text-red-400">Delete</Button>
                    </div>
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
