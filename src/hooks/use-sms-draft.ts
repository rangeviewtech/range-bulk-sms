'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { toast } from 'sonner';
import type { SmsDraft, SmsDraftFormData, DraftSaveStatus } from '@/types/sms-draft';

export interface UseSmsDraftOptions {
  formData: SmsDraftFormData;
  enabled?: boolean;
  autosaveInterval?: number; // default 1500ms
  onDraftLoaded?: (draft: SmsDraft) => void;
  onDraftSaved?: (draft: SmsDraft, isAutosave: boolean) => void;
  onConflict?: (conflictDraft: SmsDraft) => void;
}

function normalizeFormSnapshot(data: SmsDraftFormData): SmsDraftFormData {
  return {
    senderId: data.senderId || '',
    deliveryMode: data.deliveryMode || 'manual',
    manualRecipients: data.manualRecipients || '',
    message: data.message || '',
    recipientCount: data.recipientCount ?? 0,
    selectedGroupId: data.selectedGroupId || null,
    importFilename: data.importFilename || null,
    importRowCount: data.importRowCount ?? null,
    templateId: data.templateId || null,
    metadata: data.metadata || null,
  };
}

function areFormsEqual(a: SmsDraftFormData, b: SmsDraftFormData): boolean {
  return (
    (a.senderId || '') === (b.senderId || '') &&
    (a.deliveryMode || 'manual') === (b.deliveryMode || 'manual') &&
    (a.manualRecipients || '').trim() === (b.manualRecipients || '').trim() &&
    (a.message || '').trim() === (b.message || '').trim() &&
    (a.selectedGroupId || null) === (b.selectedGroupId || null) &&
    (a.importFilename || null) === (b.importFilename || null) &&
    (a.templateId || null) === (b.templateId || null)
  );
}

export function useSmsDraft({
  formData,
  enabled = true,
  autosaveInterval = 1500,
  onDraftLoaded,
  onDraftSaved,
  onConflict,
}: UseSmsDraftOptions) {
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [activeDraftTitle, setActiveDraftTitle] = useState<string | null>(null);
  const [draftVersion, setDraftVersion] = useState<number>(1);
  const [saveStatus, setSaveStatus] = useState<DraftSaveStatus>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [draftsCount, setDraftsCount] = useState<number>(0);

  // Baseline tracks the last cleanly saved or loaded state
  const [baseline, setBaseline] = useState<SmsDraftFormData>(() => normalizeFormSnapshot(formData));
  const activeDraftIdRef = useRef<string | null>(activeDraftId);
  const draftVersionRef = useRef<number>(draftVersion);
  const formDataRef = useRef<SmsDraftFormData>(formData);
  const isSavingRef = useRef<boolean>(false);
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  const onDraftLoadedRef = useRef(onDraftLoaded);
  useEffect(() => {
    onDraftLoadedRef.current = onDraftLoaded;
  }, [onDraftLoaded]);

  const onDraftSavedRef = useRef(onDraftSaved);
  useEffect(() => {
    onDraftSavedRef.current = onDraftSaved;
  }, [onDraftSaved]);

  const onConflictRef = useRef(onConflict);
  useEffect(() => {
    onConflictRef.current = onConflict;
  }, [onConflict]);

  useEffect(() => {
    activeDraftIdRef.current = activeDraftId;
  }, [activeDraftId]);

  useEffect(() => {
    draftVersionRef.current = draftVersion;
  }, [draftVersion]);

  // Compute dirty status by checking if current formData differs from baseline
  const isDirty = !areFormsEqual(formData, baseline);

  const hasMeaningfulContent =
    formData.message.trim().length > 0 ||
    (formData.deliveryMode === 'manual' && formData.manualRecipients.trim().length > 0);

  // Refresh total drafts count
  const refreshDraftsCount = useCallback(async () => {
    try {
      const res = await fetch('/api/sms/drafts?limit=1');
      if (res.ok) {
        const json = await res.json();
        if (json.pagination && typeof json.pagination.total === 'number') {
          setDraftsCount(json.pagination.total);
        }
      }
    } catch {
      // Ignore count fetch errors silently
    }
  }, []);

  // Initial count fetch
  useEffect(() => {
    refreshDraftsCount();
  }, [refreshDraftsCount]);

  // Core save function
  const saveDraft = useCallback(
    async (customTitle?: string, isAutosave = false): Promise<SmsDraft | null> => {
      if (isSavingRef.current) return null;
      isSavingRef.current = true;
      setSaveStatus('saving');
      setErrorMessage(null);

      // Cancel any pending timer
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }

      try {
        const currentDraftId = activeDraftIdRef.current;
        const currentVersion = draftVersionRef.current;
        const currentData = formDataRef.current;

        const payload = {
          title: customTitle || activeDraftTitle || undefined,
          senderId: currentData.senderId || undefined,
          deliveryMode: currentData.deliveryMode || 'manual',
          message: currentData.message || '',
          manualRecipients: currentData.manualRecipients || '',
          recipientCount: currentData.recipientCount ?? 0,
          selectedGroupId: currentData.selectedGroupId || undefined,
          importFilename: currentData.importFilename || undefined,
          importRowCount: currentData.importRowCount ?? undefined,
          templateId: currentData.templateId || undefined,
          metadata: currentData.metadata || undefined,
          version: currentVersion,
        };

        let res: Response;
        if (currentDraftId) {
          // Update existing draft
          res = await fetch(`/api/sms/drafts/${currentDraftId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else {
          // Create new draft
          res = await fetch('/api/sms/drafts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }

        if (res.status === 409) {
          const errData = await res.json().catch(() => ({}));
          setSaveStatus('conflict');
          setErrorMessage('Draft has been modified in another session. Please review or reload.');
          if (errData.currentDraft) {
            onConflictRef.current?.(errData.currentDraft);
          }
          if (!isAutosave) {
            toast.error('Conflict detected: This draft was modified in another session.');
          }
          return null;
        }

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          const errMsg = errData.error || 'Failed to save draft';
          setSaveStatus('error');
          setErrorMessage(errMsg);
          if (!isAutosave) {
            toast.error(errMsg);
          }
          return null;
        }

        const json = await res.json();
        const savedDraft: SmsDraft = json.data;

        setActiveDraftId(savedDraft.id);
        setActiveDraftTitle(savedDraft.title);
        setDraftVersion(savedDraft.version);
        setLastSavedAt(new Date(savedDraft.updatedAt));
        setBaseline(normalizeFormSnapshot(currentData));
        setSaveStatus('saved');

        if (!currentDraftId) {
          setDraftsCount((prev) => prev + 1);
        }

        onDraftSavedRef.current?.(savedDraft, isAutosave);

        if (!isAutosave) {
          toast.success(currentDraftId ? 'Draft updated' : 'Draft saved successfully');
        }

        // Auto-revert 'saved' to 'idle' after 3 seconds
        setTimeout(() => {
          setSaveStatus((current) => (current === 'saved' ? 'idle' : current));
        }, 3000);

        return savedDraft;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Network error while saving draft';
        setSaveStatus('error');
        setErrorMessage(msg);
        if (!isAutosave) {
          toast.error(msg);
        }
        return null;
      } finally {
        isSavingRef.current = false;
      }
    },
    [activeDraftTitle]
  );

  // Load an existing draft
  const loadDraft = useCallback(
    async (draftId: string): Promise<SmsDraft | null> => {
      try {
        const res = await fetch(`/api/sms/drafts/${draftId}`);
        if (!res.ok) {
          toast.error('Could not find or load the requested draft');
          return null;
        }

        const json = await res.json();
        const draft: SmsDraft = json.data;

        setActiveDraftId(draft.id);
        setActiveDraftTitle(draft.title);
        setDraftVersion(draft.version);
        setLastSavedAt(new Date(draft.updatedAt));
        setSaveStatus('idle');
        setErrorMessage(null);

        const loadedFormData: SmsDraftFormData = {
          senderId: draft.senderId || '',
          deliveryMode: draft.deliveryMode || 'manual',
          manualRecipients: draft.manualRecipients || '',
          message: draft.message || '',
          recipientCount: draft.recipientCount,
          selectedGroupId: draft.selectedGroupId,
          importFilename: draft.importFilename,
          importRowCount: draft.importRowCount,
          templateId: draft.templateId,
          metadata: draft.metadata,
        };

        setBaseline(normalizeFormSnapshot(loadedFormData));
        onDraftLoadedRef.current?.(draft);
        toast.info(`Restored draft: "${draft.title}"`);
        return draft;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to load draft');
        return null;
      }
    },
    []
  );

  // Duplicate a draft
  const duplicateDraft = useCallback(
    async (draftId: string): Promise<SmsDraft | null> => {
      try {
        const res = await fetch(`/api/sms/drafts/${draftId}/duplicate`, {
          method: 'POST',
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          toast.error(errData.error || 'Failed to duplicate draft');
          return null;
        }

        const json = await res.json();
        const duplicated: SmsDraft = json.data;
        setDraftsCount((prev) => prev + 1);
        toast.success(`Duplicated draft: "${duplicated.title}"`);
        return duplicated;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to duplicate draft');
        return null;
      }
    },
    []
  );

  // Delete a draft
  const deleteDraft = useCallback(
    async (draftId: string): Promise<boolean> => {
      try {
        const res = await fetch(`/api/sms/drafts/${draftId}`, {
          method: 'DELETE',
        });
        if (!res.ok) {
          toast.error('Failed to delete draft');
          return false;
        }

        if (activeDraftIdRef.current === draftId) {
          setActiveDraftId(null);
          setActiveDraftTitle(null);
          setDraftVersion(1);
          setSaveStatus('idle');
          setBaseline(
            normalizeFormSnapshot({
              senderId: formData.senderId,
              deliveryMode: 'manual',
              manualRecipients: '',
              message: '',
            })
          );
        }

        setDraftsCount((prev) => Math.max(0, prev - 1));
        toast.success('Draft deleted');
        return true;
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to delete draft');
        return false;
      }
    },
    [formData.senderId]
  );

  // Clear active draft to start a fresh message
  const clearActiveDraft = useCallback((defaultSenderId = 'RANGESMS') => {
    setActiveDraftId(null);
    setActiveDraftTitle(null);
    setDraftVersion(1);
    setSaveStatus('idle');
    setLastSavedAt(null);
    setErrorMessage(null);
    setBaseline(
      normalizeFormSnapshot({
        senderId: defaultSenderId,
        deliveryMode: 'manual',
        manualRecipients: '',
        message: '',
      })
    );
  }, []);

  // Update baseline manually when needed
  const syncBaseline = useCallback((data: SmsDraftFormData) => {
    setBaseline(normalizeFormSnapshot(data));
  }, []);

  // Intelligent debounced autosave effect
  useEffect(() => {
    if (!enabled) return;

    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    // Only autosave if there are actual unsaved changes, meaningful content exists,
    // and we're not currently in conflict or saving
    if (isDirty && hasMeaningfulContent && saveStatus !== 'conflict' && !isSavingRef.current) {
      autosaveTimerRef.current = setTimeout(() => {
        saveDraft(undefined, true);
      }, autosaveInterval);
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
      }
    };
  }, [formData, isDirty, hasMeaningfulContent, enabled, autosaveInterval, saveStatus, saveDraft]);

  // Keyboard shortcut: Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (hasMeaningfulContent) {
          saveDraft();
        } else {
          toast.info('Cannot save an empty draft. Please enter message content or recipients.');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasMeaningfulContent, saveDraft]);

  return {
    activeDraftId,
    activeDraftTitle,
    draftVersion,
    saveStatus,
    lastSavedAt,
    isDirty,
    errorMessage,
    draftsCount,
    saveDraft,
    loadDraft,
    duplicateDraft,
    deleteDraft,
    clearActiveDraft,
    syncBaseline,
    refreshDraftsCount,
    setSaveStatus,
  };
}
