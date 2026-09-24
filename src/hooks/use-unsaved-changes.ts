'use client';

import { useEffect, useCallback, useId, useRef } from 'react';
import { useUnsavedChangesContext, type DirtyStateOptions } from '@/providers/unsaved-changes-provider';

export interface UseUnsavedChangesOptions extends DirtyStateOptions {
  id?: string;
  isDirty: boolean;
}

export function useUnsavedChanges(options: UseUnsavedChangesOptions) {
  const generatedId = useId();
  const formId = options.id || generatedId;
  const ctx = useUnsavedChangesContext();

  const isDirty = options.isDirty;
  const title = options.title;
  const message = options.message;

  const ctxRef = useRef(ctx);
  useEffect(() => {
    ctxRef.current = ctx;
  }, [ctx]);

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  });

  // Unregister only when unmounting or when formId changes
  useEffect(() => {
    return () => {
      ctxRef.current?.unregisterDirtyState(formId);
    };
  }, [formId]);

  // Synchronize dirty state registration when isDirty changes
  useEffect(() => {
    ctxRef.current?.registerDirtyState(formId, isDirty, {
      onDiscard: () => optionsRef.current.onDiscard?.(),
      title: optionsRef.current.title,
      message: optionsRef.current.message,
    });
  }, [formId, isDirty]);

  const confirmDiscard = useCallback(
    (action: () => void) => {
      if (!ctx || !isDirty) {
        action();
        return;
      }
      ctx.confirmNavigation(action, {
        title,
        message,
      });
    },
    [ctx, isDirty, title, message]
  );

  const bypassNextNavigation = useCallback(() => {
    if (ctx) {
      ctx.bypassNextNavigation();
    }
  }, [ctx]);

  return {
    isDirty: options.isDirty,
    confirmDiscard,
    bypassNextNavigation,
  };
}
