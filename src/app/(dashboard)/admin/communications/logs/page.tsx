import { requirePermission } from '@/lib/auth/authorization';
import { prisma as db } from '@/lib/prisma';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function LogsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; limit?: string }>
}) {
  await requirePermission('audit_logs.read');
  const { page = '1', limit = '50' } = await searchParams;
  
  const pageNumber = Math.max(1, parseInt(page, 10) || 1);
  const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
  
  const [logs, total] = await Promise.all([
    db.communicationLog.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (pageNumber - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        channel: true,
        recipient: true,
        template: true,
        provider: true,
        status: true,
        errorReason: true,
        createdAt: true,
      }
    }),
    db.communicationLog.count()
  ]);
  
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader 
        heading="Communication Logs" 
        description="Audit trail of sent emails and SMS messages."
      />

      <Card>
        <CardHeader>
          <CardTitle>Recent Messages</CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          <div className="overflow-x-auto">
            <Table className="min-w-[650px]">
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
                  logs.map((log) => (
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
          
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 sm:p-0 border-t sm:border-t-0 mt-4">
              <div className="text-sm text-muted-foreground text-center sm:text-left">
                Showing {((pageNumber - 1) * pageSize) + 1} to {Math.min(pageNumber * pageSize, total)} of {total} entries
              </div>
              <div className="flex items-center justify-center gap-2 w-full sm:w-auto">
                <a 
                  href={`?page=${pageNumber - 1}&limit=${pageSize}`} 
                  className={`flex-1 sm:flex-initial text-center px-3 py-1.5 text-sm border rounded-md hover:bg-muted ${pageNumber <= 1 ? 'pointer-events-none opacity-50' : ''}`}
                >
                  Previous
                </a>
                <a 
                  href={`?page=${pageNumber + 1}&limit=${pageSize}`} 
                  className={`flex-1 sm:flex-initial text-center px-3 py-1.5 text-sm border rounded-md hover:bg-muted ${pageNumber >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
                >
                  Next
                </a>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
