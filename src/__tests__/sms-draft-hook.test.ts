// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSmsDraft } from '@/hooks/use-sms-draft';
import type { SmsDraftFormData } from '@/types/sms-draft';

describe('useSmsDraft Hook', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const defaultFormData: SmsDraftFormData = {
    senderId: 'RANGESMS',
    deliveryMode: 'manual',
    manualRecipients: '',
    message: '',
    recipientCount: 0,
    selectedGroupId: null,
    templateId: null,
  };

  it('initializes with clean status and null activeDraftId', () => {
    const { result } = renderHook(() =>
      useSmsDraft({
        formData: defaultFormData,
      })
    );

    expect(result.current.activeDraftId).toBeNull();
    expect(result.current.draftVersion).toBe(1);
    expect(result.current.saveStatus).toBe('idle');
    expect(result.current.isDirty).toBe(false);
  });

  it('marks isDirty true when message or recipients change', () => {
    let currentData = { ...defaultFormData };
    const { result, rerender } = renderHook(
      ({ data }) =>
        useSmsDraft({
          formData: data,
        }),
      {
        initialProps: { data: currentData },
      }
    );

    expect(result.current.isDirty).toBe(false);

    currentData = { ...currentData, message: 'New test message' };
    rerender({ data: currentData });

    expect(result.current.isDirty).toBe(true);
  });

  it('triggers debounced autosave when dirty with meaningful content', async () => {
    const mockSavedDraft = {
      id: 'draft-auto-1',
      title: 'Auto saved message',
      version: 1,
      updatedAt: new Date().toISOString(),
      senderId: 'RANGESMS',
      deliveryMode: 'manual',
      message: 'Auto saved message',
      manualRecipients: '',
      recipientCount: 0,
      selectedGroupId: null,
      importFilename: null,
      importRowCount: null,
      templateId: null,
      metadata: null,
      isShared: false,
      lastEditedById: 'user-1',
      lastAutosavedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      userId: 'user-1',
      organizationId: null,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ success: true, data: mockSavedDraft }),
    });

    const onDraftSaved = vi.fn();

    const { result, rerender } = renderHook(
      ({ data }) =>
        useSmsDraft({
          formData: data,
          autosaveInterval: 1000,
          onDraftSaved,
        }),
      {
        initialProps: { data: defaultFormData },
      }
    );

    // Update with meaningful content
    const updatedData = { ...defaultFormData, message: 'Auto saved message' };
    rerender({ data: updatedData });

    expect(result.current.isDirty).toBe(true);

    // Fast-forward debounce timer
    await act(async () => {
      vi.advanceTimersByTime(1100);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/sms/drafts',
      expect.objectContaining({
        method: 'POST',
      })
    );
    expect(result.current.activeDraftId).toBe('draft-auto-1');
    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.isDirty).toBe(false);
  });

  it('clears active draft on clearActiveDraft', () => {
    const { result } = renderHook(() =>
      useSmsDraft({
        formData: defaultFormData,
      })
    );

    act(() => {
      result.current.clearActiveDraft('RANGESMS');
    });

    expect(result.current.activeDraftId).toBeNull();
    expect(result.current.activeDraftTitle).toBeNull();
    expect(result.current.saveStatus).toBe('idle');
    expect(result.current.isDirty).toBe(false);
  });
});
