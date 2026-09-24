'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';
import { formatRelativeDate } from '@/utils/date';
import {
  Search,
  FileText,
  Copy,
  Trash2,
  ArrowRight,
  Clock,
  Loader2,
  Users,
  Send,
  Upload,
  AlertCircle,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SmsDraft } from '@/types/sms-draft';

export interface DraftsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeDraftId: string | null;
  isFormDirty: boolean;
  onSelectDraft: (draft: SmsDraft) => void;
  onDuplicateDraft: (draftId: string) => Promise<SmsDraft | null>;
  onDeleteDraft: (draftId: string) => Promise<boolean>;
  confirmDiscard?: (action: () => void) => void;
}

export function DraftsDrawer({
  open,
  onOpenChange,
  activeDraftId,
  isFormDirty,
  onSelectDraft,
  onDuplicateDraft,
  onDeleteDraft,
  confirmDiscard,
}: DraftsDrawerProps) {
  const [drafts, setDrafts] = useState<SmsDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionDraftId, setActionDraftId] = useState<string | null>(null);
  const [draftToDelete, setDraftToDelete] = useState<SmsDraft | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDrafts = useCallback(async (query = '') => {
    setLoading(true);
    try {
      const url = query
        ? `/api/sms/drafts?search=${encodeURIComponent(query)}&limit=50`
        : '/api/sms/drafts?limit=50';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        setDrafts(json.data || []);
      }
    } catch {
      // Ignore network errors gracefully
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      fetchDrafts(searchQuery);
    }
  }, [open, searchQuery, fetchDrafts]);

  const handleSelectDraft = (draft: SmsDraft) => {
    if (draft.id === activeDraftId) {
      onOpenChange(false);
      return;
    }

    const proceed = () => {
      onSelectDraft(draft);
      onOpenChange(false);
    };

    if (isFormDirty && confirmDiscard) {
      confirmDiscard(proceed);
    } else {
      proceed();
    }
  };

  const handleDuplicate = async (draftId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActionDraftId(draftId);
    try {
      await onDuplicateDraft(draftId);
      await fetchDrafts(searchQuery);
    } finally {
      setActionDraftId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!draftToDelete) return;
    setIsDeleting(true);
    try {
      const success = await onDeleteDraft(draftToDelete.id);
      if (success) {
        setDrafts((prev) => prev.filter((d) => d.id !== draftToDelete.id));
        setDraftToDelete(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg p-0 flex flex-col h-full bg-background"
        >
          <SheetHeader className="p-4 sm:p-6 border-b border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <SheetTitle className="text-lg font-bold flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Saved Drafts
                </SheetTitle>
                <SheetDescription className="text-xs text-muted-foreground mt-1">
                  Resume work on in-progress messages and scheduled broadcasts.
                </SheetDescription>
              </div>
            </div>

            <div className="relative mt-4">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by title, recipient, or message..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8 text-xs sm:text-sm h-9"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="text-xs">Loading drafts...</span>
              </div>
            ) : drafts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center px-4 space-y-3">
                <div className="p-3 rounded-full bg-muted/60 text-muted-foreground">
                  <FileText className="w-8 h-8 opacity-60" />
                </div>
                <div className="space-y-1 max-w-xs">
                  <h4 className="font-semibold text-sm text-foreground">
                    {searchQuery ? 'No matching drafts found' : 'No saved drafts'}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    {searchQuery
                      ? `No drafts matched "${searchQuery}". Try a different keyword.`
                      : 'When you compose a message, it will automatically be saved here so you never lose progress.'}
                  </p>
                </div>
              </div>
            ) : (
              drafts.map((draft) => {
                const isActive = draft.id === activeDraftId;
                const isActionBusy = actionDraftId === draft.id;

                return (
                  <div
                    key={draft.id}
                    onClick={() => handleSelectDraft(draft)}
                    className={cn(
                      'group relative rounded-xl border p-4 transition-all cursor-pointer text-left',
                      'hover:border-primary/50 hover:shadow-sm bg-card',
                      isActive
                        ? 'border-primary ring-1 ring-primary/40 bg-primary/5 dark:bg-primary/10'
                        : 'border-border'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-sm text-foreground truncate max-w-[240px]">
                            {draft.title || 'Untitled Draft'}
                          </h4>
                          {isActive && (
                            <Badge
                              variant="default"
                              className="text-[10px] h-4 px-1.5 py-0 bg-primary font-medium"
                            >
                              Currently Active
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap text-[11px] text-muted-foreground">
                          {draft.senderId && (
                            <span className="font-medium text-foreground/80">
                              {draft.senderId}
                            </span>
                          )}
                          <span>•</span>
                          <span className="capitalize inline-flex items-center gap-1">
                            {draft.deliveryMode === 'groups' ? (
                              <Users className="w-3 h-3" />
                            ) : draft.deliveryMode === 'import' ? (
                              <Upload className="w-3 h-3" />
                            ) : (
                              <Send className="w-3 h-3" />
                            )}
                            {draft.deliveryMode}
                          </span>
                          <span>•</span>
                          <span>
                            {draft.recipientCount}{' '}
                            {draft.recipientCount === 1 ? 'recipient' : 'recipients'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-foreground"
                          title="Duplicate draft"
                          disabled={isActionBusy}
                          onClick={(e) => handleDuplicate(draft.id, e)}
                        >
                          {isActionBusy ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          title="Delete draft"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDraftToDelete(draft);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    {draft.message ? (
                      <p className="mt-2.5 text-xs text-muted-foreground font-mono bg-muted/30 rounded p-2 line-clamp-2 border border-border/40">
                        {draft.message}
                      </p>
                    ) : (
                      <p className="mt-2.5 text-xs text-muted-foreground/60 italic">
                        No message body yet.
                      </p>
                    )}

                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/40">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatRelativeDate(draft.updatedAt)}
                      </span>
                      <span className="inline-flex items-center gap-1 font-medium text-primary group-hover:underline">
                        {isActive ? 'Continue editing' : 'Resume draft'}
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Confirmation Dialog for Deletion */}
      <ConfirmationDialog
        open={!!draftToDelete}
        onOpenChange={(open) => {
          if (!open) setDraftToDelete(null);
        }}
        title="Delete Draft?"
        description={`Are you sure you want to delete "${draftToDelete?.title || 'Untitled Draft'}"? This action cannot be undone.`}
        confirmLabel="Delete Draft"
        cancelLabel="Keep Draft"
        variant="destructive"
        loading={isDeleting}
        icon={<AlertCircle className="w-5 h-5 text-destructive" />}
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
}
