'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputError } from '@/components/ui/input-error';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, MoreHorizontal, Tag, Loader2, X, ArrowDownUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFormValidation } from '@/hooks/use-form-validation';
import { tagFormSchema, type TagFormInput } from '@/lib/validations/settings';
import { toast } from 'sonner';
import { useTableState } from '@/hooks/use-table-state';
import { SortableHeader } from '@/components/ui/sortable-header';
import { Pagination } from '@/components/ui/pagination';

interface TagItem {
  id: string;
  name: string;
  color: string;
  contactsCount: number;
  createdAt: string;
}

const INITIAL_TAGS: TagItem[] = [
  { id: '1', name: 'High Value', color: 'Purple', contactsCount: 450, createdAt: '2026-10-10' },
  { id: '2', name: 'Active', color: 'Green', contactsCount: 8120, createdAt: '2026-10-01' },
  { id: '3', name: 'Newsletter Subscriber', color: 'Blue', contactsCount: 14200, createdAt: '2026-09-15' },
  { id: '4', name: 'Lead Qualified', color: 'Green', contactsCount: 1250, createdAt: '2026-08-20' },
  { id: '5', name: 'VIP Customer', color: 'Purple', contactsCount: 320, createdAt: '2026-07-12' },
  { id: '6', name: 'Churn Risk', color: 'Red', contactsCount: 85, createdAt: '2026-08-01' },
  { id: '7', name: 'Kampala Central', color: 'Default', contactsCount: 6500, createdAt: '2026-06-18' },
  { id: '8', name: 'Entebbe Region', color: 'Default', contactsCount: 2300, createdAt: '2026-06-25' },
  { id: '9', name: 'Corporate Account', color: 'Blue', contactsCount: 940, createdAt: '2026-05-14' },
  { id: '10', name: 'Wholesale Buyer', color: 'Purple', contactsCount: 410, createdAt: '2026-04-30' },
  { id: '11', name: 'Inactive 90 Days', color: 'Red', contactsCount: 520, createdAt: '2026-09-05' },
  { id: '12', name: 'Event Attendee', color: 'Yellow', contactsCount: 1800, createdAt: '2026-08-15' },
];

export default function ContactTagsPage() {
  const [tags, setTags] = useState<TagItem[]>(INITIAL_TAGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { values, errors, touched, setFieldValue, handleBlur, validateAll, reset } =
    useFormValidation<TagFormInput>({
      schema: tagFormSchema,
      initialValues: {
        name: '',
        color: 'Default',
      },
    });

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
    paginatedData: displayedTags,
  } = useTableState<TagItem>({
    data: tags,
    searchFields: ['name', 'color', (t) => String(t.contactsCount), 'createdAt'],
    initialSortKey: 'createdAt',
    initialSortOrder: 'desc',
    initialPageSize: 5,
    initialFilters: { color: 'ALL' },
    filterFn: (item, currentFilters) => {
      if (currentFilters.color && currentFilters.color !== 'ALL') {
        if (item.color.toLowerCase() !== currentFilters.color.toLowerCase()) return false;
      }
      return true;
    },
    customSortFn: (a, b, key, order) => {
      let comp = 0;
      if (key === 'name') {
        comp = a.name.localeCompare(b.name);
      } else if (key === 'color') {
        comp = a.color.localeCompare(b.color);
      } else if (key === 'contactsCount') {
        comp = a.contactsCount - b.contactsCount;
      } else if (key === 'createdAt') {
        comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return order === 'asc' ? comp : -comp;
    },
  });

  // Extract unique colors dynamically
  const uniqueColors = useMemo(() => {
    const set = new Set<string>();
    tags.forEach((t) => {
      if (t.color) set.add(t.color);
    });
    return Array.from(set).sort();
  }, [tags]);

  const handleOpenModal = () => {
    reset({ name: '', color: 'Default' });
    setIsModalOpen(true);
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid } = validateAll();
    if (!isValid) return;

    setSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      const newTag: TagItem = {
        id: String(Date.now()),
        name: values.name.trim(),
        color: values.color,
        contactsCount: 0,
        createdAt: new Date().toISOString().split('T')[0],
      };
      setTags((prev) => [newTag, ...prev]);
      toast.success(`Tag "${values.name}" created successfully`);
      setIsModalOpen(false);
    } catch {
      toast.error('Failed to create tag');
    } finally {
      setSubmitting(false);
    }
  };

  const getColorClass = (color: string) => {
    switch (color.toLowerCase()) {
      case 'green':
        return 'border-emerald-500/50 text-emerald-600 bg-emerald-500/10';
      case 'purple':
        return 'border-purple-500/50 text-purple-600 bg-purple-500/10';
      case 'blue':
        return 'border-blue-500/50 text-blue-600 bg-blue-500/10';
      case 'red':
        return 'border-red-500/50 text-red-600 bg-red-500/10';
      case 'yellow':
        return 'border-amber-500/50 text-amber-600 bg-amber-500/10';
      default:
        return 'border-primary/50 text-primary bg-primary/10';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contact Tags</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage tags used to categorize your contacts.</p>
        </div>
        <Button onClick={handleOpenModal} className="w-full sm:w-auto">
          <Plus className="w-4 h-4 mr-2" />
          Create Tag
        </Button>
      </div>

      {/* Toolbar: Search, Color Filter, Sort Order */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex w-full md:max-w-sm items-center relative">
          <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
          <Input
            placeholder="Search tags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-9"
            aria-label="Search tags"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-0.5 rounded-full"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {uniqueColors.length > 0 && (
            <div className="w-36">
              <Select
                value={filters.color || 'ALL'}
                onValueChange={(val) => setFilter('color', val)}
              >
                <SelectTrigger className="h-9 text-xs" aria-label="Filter by color">
                  <SelectValue placeholder="All Colors" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Colors</SelectItem>
                  {uniqueColors.map((col) => (
                    <SelectItem key={col} value={col}>
                      {col}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="h-9 gap-1 text-xs"
            onClick={() => toggleSort(sortKey || 'createdAt')}
            title={`Order: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'}`}
            aria-label="Toggle sort order"
          >
            <ArrowDownUp className="h-3.5 w-3.5 mr-1" />
            <span className="hidden sm:inline">Order:</span> {sortOrder.toUpperCase()}
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="w-full overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>
                  <SortableHeader
                    column="name"
                    label="Tag Name"
                    currentSort={sortKey}
                    currentOrder={sortOrder}
                    onSort={toggleSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    column="color"
                    label="Color"
                    currentSort={sortKey}
                    currentOrder={sortOrder}
                    onSort={toggleSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    column="contactsCount"
                    label="Contacts Applied"
                    currentSort={sortKey}
                    currentOrder={sortOrder}
                    onSort={toggleSort}
                  />
                </TableHead>
                <TableHead>
                  <SortableHeader
                    column="createdAt"
                    label="Created"
                    currentSort={sortKey}
                    currentOrder={sortOrder}
                    onSort={toggleSort}
                  />
                </TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedTags.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    <p className="font-medium text-foreground">No contact tags found.</p>
                    <p className="text-xs mt-1">Try refining your search or color filter.</p>
                    {(search || filters.color !== 'ALL') && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => {
                          clearSearch();
                          setFilter('color', 'ALL');
                        }}
                      >
                        Reset Filters
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ) : (
                displayedTags.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        {t.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getColorClass(t.color)}>
                        {t.color}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.contactsCount.toLocaleString()}</TableCell>
                    <TableCell>{t.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" aria-label={`Manage ${t.name}`}>
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {tags.length > 0 && (
          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={totalItems}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[5, 10, 20]}
          />
        )}
      </div>

      {/* Create Tag Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] sm:max-w-xl md:max-w-2xl p-0 overflow-hidden shadow-2xl">
          <DialogHeader>
            <DialogTitle>Create New Tag</DialogTitle>
            <DialogDescription>Add a customized tag identifier to group and label contacts.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateTag} noValidate>
            <DialogBody className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="tag-name" required>Tag Name</Label>
                <Input
                  id="tag-name"
                  placeholder="e.g. VIP Member"
                  value={values.name}
                  onChange={(e) => setFieldValue('name', e.target.value)}
                  onBlur={() => handleBlur('name')}
                  error={touched.name && !!errors.name}
                  aria-describedby={touched.name && errors.name ? 'tag-name-error' : undefined}
                  autoFocus
                  required
                />
                {touched.name && errors.name && (
                  <InputError id="tag-name-error" message={errors.name} />
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="tag-color" required>Color Theme</Label>
                <Input
                  id="tag-color"
                  placeholder="e.g. Default, Green, Blue, Red, Purple, Yellow"
                  value={values.color}
                  onChange={(e) => setFieldValue('color', e.target.value)}
                  onBlur={() => handleBlur('color')}
                  error={touched.color && !!errors.color}
                  aria-describedby={touched.color && errors.color ? 'tag-color-error' : undefined}
                  required
                />
                {touched.color && errors.color && (
                  <InputError id="tag-color-error" message={errors.color} />
                )}
              </div>
            </DialogBody>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Tag
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
