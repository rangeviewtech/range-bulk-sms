import { requirePermission } from '@/lib/auth/authorization';
﻿/* eslint-disable @typescript-eslint/no-unused-vars */
 
 
import { prisma as db } from '@/lib/prisma';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Activity, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function QueuePage() {
  await requirePermission('settings.manage');
  const jobs = await db.job.findMany({
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const stats = await db.job.groupBy({
    by: ['status'],
    _count: true,
  });

  const getCount = (status: string) => stats.find(s => s.status === status)?._count || 0;

  return (
    <div className="space-y-6">
      <PageHeader 
        heading="Background Jobs & Queue" 
        description="Monitor asynchronous communication and system tasks."
      />
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCount('PENDING')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCount('PROCESSING')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dead Letter</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{getCount('DEAD_LETTER')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Succeeded (All Time)</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getCount('SUCCEEDED')}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Jobs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Queue</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Attempts</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                      No jobs found in the queue.
                    </TableCell>
                  </TableRow>
                ) : (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
                  jobs.map((job: any) => (
                    <TableRow key={job.id}>
                      <TableCell className="font-medium">{job.type}</TableCell>
                      <TableCell>{job.queue}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{job.priority}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            job.status === 'SUCCEEDED' ? 'default' : 
                            job.status === 'DEAD_LETTER' || job.status === 'FAILED' ? 'destructive' :
                            'secondary'
                          }
                        >
                          {job.status}
                        </Badge>
                        {job.lastError && (
                          <div className="text-xs text-destructive mt-1 max-w-[200px] truncate" title={job.lastError}>
                            {job.lastError}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{job.attempts} / {job.maxAttempts}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDistanceToNow(job.createdAt, { addSuffix: true })}
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
