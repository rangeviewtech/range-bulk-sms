import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Download, Filter, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';

export default function ContactsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contacts</h1>
          <p className="text-sm text-muted-foreground">Manage your contact database and groups.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Link href="/contacts/import" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
          </Link>
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center bg-card p-3 sm:p-4 rounded-lg border shadow-xs">
        <div className="flex w-full sm:max-w-sm items-center relative">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
          <Input placeholder="Search contacts..." className="pl-9 w-full" />
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 mr-2" />
            Groups
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-initial">
            <Filter className="w-4 h-4 mr-2" />
            Tags
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-w-[650px]">
          <Table className="min-w-[650px]">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone Number</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Groups</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <Link href="/contacts/1" className="hover:underline text-primary">John Doe</Link>
              </TableCell>
              <TableCell>+256 700 123456</TableCell>
              <TableCell>john@example.com</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Badge variant="secondary">VIP</Badge>
                  <Badge variant="secondary">Customers</Badge>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <Link href="/contacts/2" className="hover:underline text-primary">Jane Smith</Link>
              </TableCell>
              <TableCell>+256 772 987654</TableCell>
              <TableCell>jane@example.com</TableCell>
              <TableCell>
                <div className="flex gap-1">
                  <Badge variant="secondary">Leads</Badge>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
