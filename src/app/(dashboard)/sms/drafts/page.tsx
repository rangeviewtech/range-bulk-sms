'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  FileEdit,
  Plus,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  X,
  Copy,
  Trash2,
  ArrowRight,
  Clock,
  Users,
  Send,
  RefreshCw,
  Layers,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';
import { Pagination } from '@/components/ui/pagination';
import { SortableHeader } from '@/components/ui/sortable-header';
import { useTableState } from '@/hooks/use-table-state';
import { SmsDraft } from '@/types/sms-draft';
import { cn } from '@/lib/utils';
import { TemplateHighlighter } from '@/components/sms/template-highlighter';

function formatRelativeTime(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Just now';
    if (diffMin === 1) return '1 minute ago';
    if (diffMin < 60) return `${diffMin} minutes ago`;
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  } catch {
    return 'Recently';
  }
}

export default function DraftsPage() {
  const [drafts, setDrafts] = useState<SmsDraft[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SmsDraft | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDrafts = useCallback(async (showRefreshingToast = false) => {
    try {
      if (showRefreshingToast) setIsRefreshing(true);
      const res = await fetch('/api/sms/drafts?limit=100');
      if (!res.ok) {
        throw new Error('Failed to load draft messages');
      }
      const json = await res.json();
      setDrafts(json.data || []);
      if (showRefreshingToast) {
        toast.success('Draft messages refreshed');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error retrieving drafts');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // Table filtering, sorting, and pagination hook
  const {
    search,
    setSearch,
    clearSearch,
    sortKey,
    sortOrder,
    toggleSort,
    filters,
    setFilter,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    totalItems,
    paginatedData,
  } = useTableState<SmsDraft>({
    data: drafts,
    searchFields: ['title', 'message', 'senderId', 'manualRecipients'],
    initialSortKey: 'updatedAt',
    initialSortOrder: 'desc',
    initialPageSize: 10,
    filterFn: (item, currentFilters) => {
      const mode = currentFilters.deliveryMode;
      if (mode && mode !== 'ALL') {
        if (item.deliveryMode !== mode) return false;
      }
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === 'title') {
        comp = a.title.localeCompare(b.title);
      } else if (key === 'updatedAt') {
        comp = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (key === 'recipientCount') {
        comp = a.recipientCount - b.recipientCount;
      } else if (key === 'deliveryMode') {
        comp = a.deliveryMode.localeCompare(b.deliveryMode);
      }
      return order === 'asc' ? comp : -comp;
    },
  });

  // KPI Metrics
  const stats = useMemo(() => {
    const total = drafts.length;
    const manual = drafts.filter((d) => d.deliveryMode === 'manual').length;
    const groups = drafts.filter((d) => d.deliveryMode === 'groups').length;
    const imports = drafts.filter((d) => d.deliveryMode === 'import').length;
    const totalRecipients = drafts.reduce((acc, d) => acc + (d.recipientCount || 0), 0);
    return { total, manual, groups, imports, totalRecipients };
  }, [drafts]);

  // Duplicate a draft
  const handleDuplicate = async (draft: SmsDraft) => {
    try {
      const res = await fetch(`/api/sms/drafts/${draft.id}/duplicate`, {
        method: 'POST',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to duplicate draft');
      }
      const json = await res.json();
      const duplicated: SmsDraft = json.data;
      setDrafts((prev) => [duplicated, ...prev]);
      toast.success(`Duplicated draft: "${duplicated.title}"`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error duplicating draft');
    }
  };

  // Confirm draft deletion
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/sms/drafts/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        throw new Error('Failed to delete draft');
      }
      setDrafts((prev) => prev.filter((d) => d.id !== deleteTarget.id));
      toast.success(`Deleted draft: "${deleteTarget.title}"`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Error deleting draft');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Draft Messages"
        description="Review, resume editing, duplicate, or delete your unfinished SMS broadcasts."
        action={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDrafts(true)}
              disabled={isRefreshing}
              className="hidden sm:inline-flex gap-2"
              title="Refresh drafts"
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
              <span>Refresh</span>
            </Button>
            <Button
              asChild
              className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90"
            >
              <Link href="/sms/send">
                <Plus className="w-4 h-4 mr-2" />
                Compose Message
              </Link>
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-border/60 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary shrink-0">
              <FileEdit className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Total Drafts
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {isLoading ? '—' : stats.total}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 shrink-0">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Manual Drafts
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {isLoading ? '—' : stats.manual}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Group / Import
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {isLoading ? '—' : stats.groups + stats.imports}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 bg-card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Queued Recipients
              </p>
              <h3 className="text-2xl font-bold tracking-tight text-foreground">
                {isLoading ? '—' : stats.totalRecipients.toLocaleString()}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 sm:gap-4 justify-between items-stretch md:items-center bg-card p-3.5 sm:p-4 rounded-xl border border-border shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by title, message body, sender ID, or recipients..."
              className="pl-9 pr-8 w-full text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-sm"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Delivery Mode Filter */}
          <Select
            value={filters.deliveryMode || 'ALL'}
            onValueChange={(val) => setFilter('deliveryMode', val)}
          >
            <SelectTrigger className="w-full sm:w-[170px] h-9 text-xs">
              <Filter className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="All Modes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Delivery Modes</SelectItem>
              <SelectItem value="manual">Manual Direct</SelectItem>
              <SelectItem value="groups">Contact Groups</SelectItem>
              <SelectItem value="import">File Import</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort Order Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-9 px-3 gap-1.5 shrink-0"
            onClick={() => toggleSort(sortKey || 'updatedAt')}
            title={`Sort Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
          >
            {sortOrder === 'asc' ? (
              <ArrowUp className="w-3.5 h-3.5 text-primary" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-primary" />
            )}
            <span className="text-xs uppercase font-medium">{sortOrder}</span>
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <Card className="border-border overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <RefreshCw className="w-8 h-8 mx-auto text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">Loading draft messages...</p>
            </div>
          ) : drafts.length === 0 ? (
            /* Empty State: No Drafts at all */
            <div className="p-12 text-center space-y-4 max-w-md mx-auto">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <FileEdit className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold text-foreground">No draft messages yet</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  When you begin composing an SMS broadcast at Quick SMS, your work will be automatically
                  saved here so you can resume anytime without losing progress.
                </p>
              </div>
              <Button asChild className="bg-primary text-primary-foreground font-semibold hover:bg-primary/90 mt-2">
                <Link href="/sms/send">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Start Composing SMS
                </Link>
              </Button>
            </div>
          ) : paginatedData.length === 0 ? (
            /* Empty State: Search / Filter yielded no results */
            <div className="p-12 text-center space-y-3 max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto text-muted-foreground">
                <Search className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-foreground">No matching drafts found</h4>
                <p className="text-xs text-muted-foreground">
                  Try adjusting your search query or reset the delivery mode filter.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => { clearSearch(); setFilter('deliveryMode', 'ALL'); }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-border/80">
                      <TableHead className="w-[38%]">
                        <SortableHeader
                          label="Title & Message Preview"
                          column="title"
                          currentSort={sortKey}
                          currentOrder={sortOrder}
                          onSort={toggleSort}
                        />
                      </TableHead>
                      <TableHead className="w-[14%]">Sender ID</TableHead>
                      <TableHead className="w-[14%]">
                        <SortableHeader
                          label="Delivery Mode"
                          column="deliveryMode"
                          currentSort={sortKey}
                          currentOrder={sortOrder}
                          onSort={toggleSort}
                        />
                      </TableHead>
                      <TableHead className="w-[12%]">
                        <SortableHeader
                          label="Recipients"
                          column="recipientCount"
                          currentSort={sortKey}
                          currentOrder={sortOrder}
                          onSort={toggleSort}
                        />
                      </TableHead>
                      <TableHead className="w-[12%]">
                        <SortableHeader
                          label="Updated"
                          column="updatedAt"
                          currentSort={sortKey}
                          currentOrder={sortOrder}
                          onSort={toggleSort}
                        />
                      </TableHead>
                      <TableHead className="w-[10%] text-right pr-4">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedData.map((draft) => (
                      <TableRow key={draft.id} className="hover:bg-muted/40 transition-colors border-border/60">
                        {/* Title & Preview */}
                        <TableCell className="py-3.5 align-top">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm text-foreground hover:text-primary transition-colors">
                                <Link href={`/sms/send?draft=${draft.id}`}>
                                  <TemplateHighlighter text={draft.title} />
                                </Link>
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                                v{draft.version}
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground font-sans line-clamp-2 leading-relaxed">
                              {draft.message?.trim() ? (
                                <TemplateHighlighter text={draft.message} />
                              ) : (
                                <span className="italic">No message content entered</span>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Sender ID */}
                        <TableCell className="align-top py-3.5">
                          <Badge variant="outline" className="font-mono text-xs bg-muted/30">
                            {draft.senderId || 'RANGESMS (Default)'}
                          </Badge>
                        </TableCell>

                        {/* Mode */}
                        <TableCell className="align-top py-3.5">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'text-xs capitalize font-medium',
                              draft.deliveryMode === 'groups' && 'bg-amber-500/10 text-amber-500 border-amber-500/20',
                              draft.deliveryMode === 'import' && 'bg-purple-500/10 text-purple-500 border-purple-500/20',
                              draft.deliveryMode === 'manual' && 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                            )}
                          >
                            {draft.deliveryMode}
                          </Badge>
                        </TableCell>

                        {/* Recipients */}
                        <TableCell className="align-top py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-foreground font-medium">
                            <Users className="w-3.5 h-3.5 text-muted-foreground" />
                            <span>{draft.recipientCount}</span>
                          </div>
                        </TableCell>

                        {/* Updated */}
                        <TableCell className="align-top py-3.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground" title={new Date(draft.updatedAt).toLocaleString()}>
                            <Clock className="w-3.5 h-3.5 shrink-0" />
                            <span>{formatRelativeTime(draft.updatedAt)}</span>
                          </div>
                        </TableCell>

                        {/* Actions */}
                        <TableCell className="align-top py-3.5 text-right pr-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              asChild
                              size="sm"
                              variant="outline"
                              className="h-8 px-2.5 text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 border-primary/30"
                              title="Resume composing message"
                            >
                              <Link href={`/sms/send?draft=${draft.id}`}>
                                Resume
                                <ArrowRight className="w-3 h-3 ml-1" />
                              </Link>
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => handleDuplicate(draft)}
                              title="Duplicate draft"
                              aria-label={`Duplicate draft "${draft.title}"`}
                            >
                              <Copy className="w-3.5 h-3.5" />
                            </Button>

                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={() => setDeleteTarget(draft)}
                              title="Delete draft"
                              aria-label={`Delete draft "${draft.title}"`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card List View */}
              <div className="md:hidden divide-y divide-border/60">
                {paginatedData.map((draft) => (
                  <div key={draft.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <Link
                          href={`/sms/send?draft=${draft.id}`}
                          className="font-semibold text-sm text-foreground hover:text-primary transition-colors block truncate"
                        >
                          <TemplateHighlighter text={draft.title} />
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-mono text-[10px] bg-muted px-1.5 py-0.2 rounded">v{draft.version}</span>
                          <span>•</span>
                          <span title={new Date(draft.updatedAt).toLocaleString()}>{formatRelativeTime(draft.updatedAt)}</span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {draft.deliveryMode}
                      </Badge>
                    </div>

                    <div className="text-xs text-muted-foreground font-sans line-clamp-2 bg-muted/20 p-2 rounded-md">
                      {draft.message?.trim() ? (
                        <TemplateHighlighter text={draft.message} />
                      ) : (
                        <span className="italic">No message content entered</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1 font-medium text-foreground">
                          <Users className="w-3.5 h-3.5 text-muted-foreground" />
                          {draft.recipientCount}
                        </span>
                        <span>{draft.senderId || 'RANGESMS'}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => handleDuplicate(draft)}
                          aria-label="Duplicate draft"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => setDeleteTarget(draft)}
                          aria-label="Delete draft"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button asChild size="sm" className="h-8 px-2.5 text-xs bg-primary text-primary-foreground font-semibold">
                          <Link href={`/sms/send?draft=${draft.id}`}>
                            Resume
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalItems > 0 && (
                <div className="p-3 sm:p-4 border-t border-border/60">
                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    pageSize={pageSize}
                    totalItems={totalItems}
                    onPageChange={setPage}
                    onPageSizeChange={setPageSize}
                    pageSizeOptions={[10, 20, 50]}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Deletion */}
      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Delete Draft Message?"
        description={`Are you sure you want to permanently delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete Draft"
        cancelLabel="Keep Draft"
        variant="destructive"
        loading={isDeleting}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
