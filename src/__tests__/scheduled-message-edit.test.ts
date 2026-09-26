// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { EditScheduledMessageDialog, ScheduledMessageData } from '@/components/sms/edit-scheduled-message-dialog';
import ScheduledSmsPage from '@/app/(dashboard)/sms/scheduled/page';

describe('Scheduled Message Edit Feature & Safety Rules', () => {
  const mockFutureItem: ScheduledMessageData = {
    id: 'test-1',
    name: 'Future Promo Campaign',
    message: 'Hello {{firstName}}, special offer on your next bulk package!',
    senderName: 'RANGESMS',
    recipients: 1000,
    scheduledAt: new Date(Date.now() + 3600 * 1000 * 24).toISOString(), // 24 hours in future
    status: 'SCHEDULED',
  };

  const mockPassedItem: ScheduledMessageData = {
    id: 'test-2',
    name: 'Expired Campaign',
    message: 'Flash sale announcement!',
    senderName: 'RANGESMS',
    recipients: 500,
    scheduledAt: new Date(Date.now() - 3600 * 1000).toISOString(), // 1 hour ago (past due)
    status: 'PAUSED',
  };

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] }),
      })
    );
  });

  afterEach(() => {
    cleanup();
  });

  describe('EditScheduledMessageDialog Safety & Rules', () => {
    it('renders the dialog with Auto-Pause notification and safety banner', () => {
      render(
        React.createElement(EditScheduledMessageDialog, {
          open: true,
          onOpenChange: vi.fn(),
          item: mockFutureItem,
          onSave: vi.fn(),
        })
      );

      // Check header and pause indicator
      expect(screen.getByText('Edit Scheduled Message')).toBeDefined();
      expect(screen.getByText('Paused for Editing')).toBeDefined();

      // Check auto-pause safety banner
      expect(screen.getByText(/Transmission Paused:/)).toBeDefined();

      // Check live phone preview
      expect(screen.getByText('Live Handset Preview')).toBeDefined();
      expect(screen.getByText('RANGESMS')).toBeDefined();
    });

    it('enforces rescheduling requirement when scheduled time is in the past', () => {
      const onSaveMock = vi.fn();
      render(
        React.createElement(EditScheduledMessageDialog, {
          open: true,
          onOpenChange: vi.fn(),
          item: mockPassedItem,
          onSave: onSaveMock,
        })
      );

      // Must show Past Due warning
      expect(screen.getByText(/Past Due — Reschedule Required/)).toBeDefined();
      expect(screen.getByText(/Rescheduling Required:/)).toBeDefined();

      // Save & Schedule button must be disabled because date is in the past
      const saveButton = screen.getByRole('button', { name: /Save & Schedule/i });
      expect(saveButton.hasAttribute('disabled')).toBe(true);

      // Clicking disabled button should not call onSave
      fireEvent.click(saveButton);
      expect(onSaveMock).not.toHaveBeenCalled();
    });

    it('allows setting quick reschedule presets (+15 mins, +1 hour, Tomorrow 9 AM) to satisfy future time requirement', () => {
      render(
        React.createElement(EditScheduledMessageDialog, {
          open: true,
          onOpenChange: vi.fn(),
          item: mockPassedItem,
          onSave: vi.fn(),
        })
      );

      const plus1HourBtn = screen.getByRole('button', { name: /\+1 Hour/i });
      expect(plus1HourBtn).toBeDefined();

      fireEvent.click(plus1HourBtn);

      // After clicking +1 Hour, the button should become enabled because time is in the future
      const saveButton = screen.getByRole('button', { name: /Save & Schedule/i });
      expect(saveButton.hasAttribute('disabled')).toBe(false);
    });

    it('allows saving as paused even if deciding time later', async () => {
      const onSaveMock = vi.fn().mockResolvedValue(undefined);
      render(
        React.createElement(EditScheduledMessageDialog, {
          open: true,
          onOpenChange: vi.fn(),
          item: mockPassedItem,
          onSave: onSaveMock,
        })
      );

      const savePausedBtn = screen.getByRole('button', { name: /Save as Paused/i });
      fireEvent.click(savePausedBtn);

      await waitFor(() => {
        expect(onSaveMock).toHaveBeenCalledWith(
          expect.objectContaining({
            id: 'test-2',
            status: 'PAUSED',
          })
        );
      });
    });
  });

  describe('Scheduled Messages Page 10-Second Lockout Rule & Mobile Responsiveness', () => {
    it('renders scheduled broadcasts table on desktop and cards on mobile', async () => {
      const { container } = render(React.createElement(ScheduledSmsPage));

      // Page Title
      expect(screen.getByText('Scheduled Messages')).toBeDefined();

      // Desktop table present (hidden md:block)
      const tableWrapper = container.querySelector('.hidden.md\\:block');
      expect(tableWrapper).not.toBeNull();

      // Mobile card deck present (block md:hidden)
      const mobileDeck = container.querySelector('.block.md\\:hidden');
      expect(mobileDeck).not.toBeNull();
    });

    it('locks edit button when a message is within 10 seconds of scheduled transmission', async () => {
      // Return a message that is 5 seconds from now
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: 'locking-msg',
                  message: 'Almost dispatching!',
                  recipientCount: 100,
                  scheduledAt: new Date(Date.now() + 5000).toISOString(),
                  status: 'SCHEDULED',
                },
              ],
            }),
        })
      );

      render(React.createElement(ScheduledSmsPage));

      await waitFor(() => {
        expect(screen.getAllByText(/Almost dispatching!/)[0]).toBeDefined();
      });

      // The edit button should be locked (< 10s)
      const lockedEditBtns = screen.getAllByTitle(/Locked for transmission/i);
      expect(lockedEditBtns.length).toBeGreaterThan(0);
      expect(lockedEditBtns[0].hasAttribute('disabled')).toBe(true);
    });

    it('automatically pauses message when editing a valid future scheduled broadcast', async () => {
      const futureTime = new Date(Date.now() + 7200 * 1000).toISOString();
      let patchPayload: Record<string, unknown> | null = null;

      global.fetch = vi.fn().mockImplementation((url, opts) => {
        if (opts?.method === 'PATCH') {
          patchPayload = JSON.parse(opts.body);
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({ success: true }),
          });
        }
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              data: [
                {
                  id: 'future-msg-1',
                  message: 'Future campaign text',
                  recipientCount: 50,
                  scheduledAt: futureTime,
                  status: 'SCHEDULED',
                },
              ],
            }),
        });
      });

      render(React.createElement(ScheduledSmsPage));

      await waitFor(() => {
        expect(screen.getAllByText(/Future campaign text/)[0]).toBeDefined();
      });

      // Find the enabled Edit button for this message
      const editBtns = screen.getAllByLabelText(/Edit.*Future campaign text/i);
      expect(editBtns.length).toBeGreaterThan(0);
      expect(editBtns[0].hasAttribute('disabled')).toBe(false);

      // Clicking Edit should fire auto-pause
      fireEvent.click(editBtns[0]);

      await waitFor(() => {
        expect(patchPayload).toEqual({
          id: 'future-msg-1',
          action: 'pause_for_edit',
        });
      });

      // And open the edit dialog
      expect(screen.getAllByText('Edit Scheduled Message')[0]).toBeDefined();
    });
  });
});
