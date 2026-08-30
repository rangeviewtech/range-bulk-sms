import { prisma as db } from '@/lib/prisma';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function LogsPage() {
  const logs = await db.communicationLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return (
    <div className="space-y-6">
      <PageHeader 
        heading="Communication Logs" 
        description="Audit trail of sent emails and SMS messages."
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No communications sent yet.
                    </TableCell>
                  </TableRow>
                ) : (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                  logs.map((log: any) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <Badge variant="outline">{log.channel}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{log.recipient}</TableCell>
                      <TableCell>{log.template || 'N/A'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{log.provider}</TableCell>
                      <TableCell>
                        <Badge variant={log.status === 'SENT' ? 'default' : 'destructive'}>
                          {log.status}
                        </Badge>
                        {log.errorReason && (
                          <div className="text-xs text-destructive mt-1 max-w-[200px] truncate" title={log.errorReason}>
                            {log.errorReason}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(log.createdAt, { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
