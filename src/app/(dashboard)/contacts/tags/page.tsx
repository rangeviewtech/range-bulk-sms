import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MoreHorizontal, Tag } from 'lucide-react';
import Link from 'next/link';

export default function ContactTagsPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contact Tags</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage tags used to categorize your contacts.</p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Tag
        </Button>
      </div>

      <div className="flex w-full sm:max-w-sm items-center relative">
        <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
        <Input placeholder="Search tags..." className="pl-9" />
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-w-[600px]">
          <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>Tag Name</TableHead>
              <TableHead>Color</TableHead>
              <TableHead>Contacts Applied</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  High Value
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="border-primary/50 text-primary">Default</Badge>
              </TableCell>
              <TableCell>450</TableCell>
              <TableCell>Oct 10, 2026</TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-500" />
                  Active
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="border-emerald-500/50 text-emerald-600">Green</Badge>
              </TableCell>
              <TableCell>8,120</TableCell>
              <TableCell>Oct 01, 2026</TableCell>
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
