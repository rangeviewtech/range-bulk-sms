'use client';

import React, {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useRouter } from 'next/navigation';
import { ConfirmationDialog } from '@/components/feedback/confirmation-dialog';

export interface DirtyStateOptions {
  onDiscard?: () => void;
  title?: string;
  message?: string;
}

export interface DirtyStateEntry {
  id: string;
  isDirty: boolean;
  onDiscard?: () => void;
  title?: string;
  message?: string;
}

interface PendingNavigation {
  type: 'url' | 'back' | 'action';
  href?: string;
  action?: () => void;
}

export interface UnsavedChangesContextType {
  isDirty: boolean;
  dirtyCount: number;
  registerDirtyState: (id: string, isDirty: boolean, options?: DirtyStateOptions) => void;
  unregisterDirtyState: (id: string) => void;
  confirmNavigation: (action: () => void, options?: { title?: string; message?: string }) => void;
  bypassNextNavigation: () => void;
}

const UnsavedChangesContext = createContext<UnsavedChangesContextType | null>(null);

export function UnsavedChangesProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [dirtyRegistry, setDirtyRegistry] = useState<Map<string, DirtyStateEntry>>(new Map());
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [activePrompt, setActivePrompt] = useState<{ title?: string; message?: string } | null>(null);

  const pendingNavigationRef = useRef<PendingNavigation | null>(null);
  const isBypassingRef = useRef(false);

  // Compute aggregate dirty state
  const isDirty = useMemo(() => {
    for (const entry of dirtyRegistry.values()) {
      if (entry.isDirty) return true;
    }
    return false;
  }, [dirtyRegistry]);

  const dirtyCount = useMemo(() => {
    let count = 0;
    for (const entry of dirtyRegistry.values()) {
      if (entry.isDirty) count++;
    }
    return count;
  }, [dirtyRegistry]);

  const registerDirtyState = useCallback((id: string, isDirtyValue: boolean, options?: DirtyStateOptions) => {
    setDirtyRegistry((prev) => {
      const existing = prev.get(id);
      if (!isDirtyValue) {
        if (!existing) return prev;
        const next = new Map(prev);
        next.delete(id);
        return next;
      }
      if (
        existing &&
        existing.isDirty === isDirtyValue &&
        existing.title === options?.title &&
        existing.message === options?.message
      ) {
        existing.onDiscard = options?.onDiscard;
        return prev;
      }
      const next = new Map(prev);
      next.set(id, {
        id,
        isDirty: isDirtyValue,
        onDiscard: options?.onDiscard,
        title: options?.title,
        message: options?.message,
      });
      return next;
    });
  }, []);

  const unregisterDirtyState = useCallback((id: string) => {
    setDirtyRegistry((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const bypassNextNavigation = useCallback(() => {
    isBypassingRef.current = true;
    setTimeout(() => {
      isBypassingRef.current = false;
    }, 1000);
  }, []);

  const promptConfirmation = useCallback((nav: PendingNavigation, promptDetails?: { title?: string; message?: string }) => {
    pendingNavigationRef.current = nav;

    // Pick custom message from registered entries if available
    let chosenTitle = promptDetails?.title;
    let chosenMessage = promptDetails?.message;

    if (!chosenTitle || !chosenMessage) {
      for (const entry of dirtyRegistry.values()) {
        if (entry.isDirty) {
          if (!chosenTitle && entry.title) chosenTitle = entry.title;
          if (!chosenMessage && entry.message) chosenMessage = entry.message;
        }
      }
    }

    setActivePrompt({
      title: chosenTitle || 'Unsaved changes',
      message: chosenMessage || 'You have unsaved changes. If you leave now, your changes will be lost.',
    });
    setConfirmOpen(true);
  }, [dirtyRegistry]);

  const confirmNavigation = useCallback(
    (action: () => void, options?: { title?: string; message?: string }) => {
      if (!isDirty || isBypassingRef.current) {
        action();
        return;
      }
      promptConfirmation({ type: 'action', action }, options);
    },
    [isDirty, promptConfirmation]
  );

  // 1. Browser beforeunload for refresh / tab close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !isBypassingRef.current) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  // 2. Intercept internal link clicks at document capture phase
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (!isDirty || isBypassingRef.current) return;

      // Find closest anchor tag
      const target = e.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;

      // Skip special links (download, new tab, modifier keys, non-left clicks)
      if (
        anchor.hasAttribute('download') ||
        anchor.target === '_blank' ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.button !== 0
      ) {
        return;
      }

      const href = anchor.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }

      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        // Only guard same-origin routes
        if (targetUrl.origin === window.location.origin) {
          const currentFull = window.location.pathname + window.location.search;
          const targetFull = targetUrl.pathname + targetUrl.search;

          if (currentFull !== targetFull) {
            e.preventDefault();
            e.stopPropagation();
            promptConfirmation({ type: 'url', href: targetFull });
          }
        }
      } catch {
        // invalid URL ignore
      }
    };

    document.addEventListener('click', handleDocumentClick, true);
    return () => {
      document.removeEventListener('click', handleDocumentClick, true);
    };
  }, [isDirty, promptConfirmation]);

  // 3. Browser Back / Forward (popstate)
  useEffect(() => {
    if (!isDirty) return;

    // Push a dummy history state to intercept the back/forward button
    window.history.pushState(null, '', window.location.href);

    const handlePopState = (_e: PopStateEvent) => {
      if (!isDirty || isBypassingRef.current) return;

      // Re-push state so URL doesn't navigate yet
      window.history.pushState(null, '', window.location.href);

      promptConfirmation({ type: 'back' });
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isDirty, promptConfirmation]);

  // Handle User Action: Leave without saving
  const handleLeave = useCallback(() => {
    isBypassingRef.current = true;
    setConfirmOpen(false);

    // Call onDiscard on all dirty entries to allow clean state reset
    dirtyRegistry.forEach((entry) => {
      if (entry.isDirty && entry.onDiscard) {
        try {
          entry.onDiscard();
        } catch {
          // ignore error in discard hook
        }
      }
    });

    // Clear registry
    setDirtyRegistry(new Map());

    const pending = pendingNavigationRef.current;
    pendingNavigationRef.current = null;

    if (pending) {
      if (pending.type === 'url' && pending.href) {
        router.push(pending.href);
      } else if (pending.type === 'back') {
        window.history.back();
      } else if (pending.type === 'action' && pending.action) {
        pending.action();
      }
    }

    setTimeout(() => {
      isBypassingRef.current = false;
    }, 500);
  }, [dirtyRegistry, router]);

  // Handle User Action: Stay
  const handleStay = useCallback(() => {
    setConfirmOpen(false);
    pendingNavigationRef.current = null;
    setActivePrompt(null);
  }, []);

  const contextValue = useMemo<UnsavedChangesContextType>(
    () => ({
      isDirty,
      dirtyCount,
      registerDirtyState,
      unregisterDirtyState,
      confirmNavigation,
      bypassNextNavigation,
    }),
    [isDirty, dirtyCount, registerDirtyState, unregisterDirtyState, confirmNavigation, bypassNextNavigation]
  );

  return (
    <UnsavedChangesContext.Provider value={contextValue}>
      {children}
      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={(open) => {
          if (!open) handleStay();
        }}
        title={activePrompt?.title || 'Unsaved changes'}
        description={
          activePrompt?.message ||
          'You have unsaved changes. If you leave now, your changes will be lost.'
        }
        confirmLabel="Leave without saving"
        cancelLabel="Stay"
        variant="destructive"
        onConfirm={handleLeave}
      />
    </UnsavedChangesContext.Provider>
  );
}

export function useUnsavedChangesContext() {
  return useContext(UnsavedChangesContext);
}
