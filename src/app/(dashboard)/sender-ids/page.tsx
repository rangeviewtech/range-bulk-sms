import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Info } from 'lucide-react';
import Link from 'next/link';

export default function SenderIdsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sender IDs</h1>
          <p className="text-muted-foreground">Manage alphanumeric sender IDs for your campaigns.</p>
        </div>
        <Link href="/sender-ids/apply">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Request Sender ID
          </Button>
        </Link>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3 text-sm">
        <Info className="w-5 h-5 text-primary shrink-0" />
        <p>
          Sender IDs are the names that appear on a recipient's phone when they receive your SMS.
          New Sender IDs must be approved before they can be used for campaigns.
        </p>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden mt-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Sender ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Requested On</TableHead>
              <TableHead>Approved On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-semibold text-lg tracking-wider">RANGE</TableCell>
              <TableCell>
                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Approved</Badge>
              </TableCell>
              <TableCell>Aug 15, 2026</TableCell>
              <TableCell>Aug 16, 2026</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold text-lg tracking-wider">PROMOS</TableCell>
              <TableCell>
                <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">Approved</Badge>
              </TableCell>
              <TableCell>Sep 02, 2026</TableCell>
              <TableCell>Sep 04, 2026</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-semibold text-lg tracking-wider">EVENTS_UG</TableCell>
              <TableCell>
                <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20">Pending</Badge>
              </TableCell>
              <TableCell>Oct 24, 2026</TableCell>
              <TableCell className="text-muted-foreground">-</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
