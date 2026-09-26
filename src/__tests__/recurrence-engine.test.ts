import { describe, it, expect } from 'vitest';
import {
  buildCronExpression,
  serializeRecurrence,
  parseRecurrence,
  describeRecurrence,
  getNextRunDate,
  isScheduledViewItem,
  type RecurrenceRule,
} from '@/lib/sms/recurrence';

describe('Recurrence Engine', () => {
  it('builds standard cron expression for daily recurrence', () => {
    const rule: RecurrenceRule = { frequency: 'DAILY', interval: 1, endType: 'NEVER' };
    const cron = buildCronExpression(rule, '09:30');
    expect(cron).toBe('30 9 * * *');
  });

  it('builds standard cron expression for weekdays recurrence', () => {
    const rule: RecurrenceRule = { frequency: 'WEEKDAYS', endType: 'NEVER' };
    const cron = buildCronExpression(rule, '14:15');
    expect(cron).toBe('15 14 * * 1-5');
  });

  it('builds standard cron expression for weekly recurrence with specific days', () => {
    const rule: RecurrenceRule = { frequency: 'WEEKLY', daysOfWeek: [1, 3, 5], endType: 'NEVER' };
    const cron = buildCronExpression(rule, '10:00');
    expect(cron).toBe('0 10 * * 1,3,5');
  });

  it('serializes and parses recurrence rules with full fidelity', () => {
    const rule: RecurrenceRule = {
      frequency: 'WEEKLY',
      interval: 2,
      daysOfWeek: [2, 4],
      endType: 'ON_DATE',
      endDate: '2026-12-31',
      maxOccurrences: 20,
    };
    const serialized = serializeRecurrence(rule, '08:45');
    const parsed = parseRecurrence(serialized);

    expect(parsed.frequency).toBe('WEEKLY');
    expect(parsed.interval).toBe(2);
    expect(parsed.daysOfWeek).toEqual([2, 4]);
    expect(parsed.endType).toBe('ON_DATE');
    expect(parsed.endDate).toBe('2026-12-31');
    expect(parsed.maxOccurrences).toBe(20);
  });

  it('generates clear human-readable recurrence descriptions', () => {
    expect(describeRecurrence({ frequency: 'DAILY', endType: 'NEVER' }, '09:00')).toBe('Daily at 09:00');
    expect(describeRecurrence({ frequency: 'WEEKDAYS', endType: 'NEVER' }, '09:00')).toBe('Every weekday (Mon–Fri) at 09:00');
    expect(describeRecurrence({ frequency: 'WEEKLY', daysOfWeek: [1, 4], endType: 'NEVER' }, '10:30')).toBe('Weekly on Mon, Thu at 10:30');
    expect(describeRecurrence({ frequency: 'MONTHLY', dayOfMonth: 28, endType: 'AFTER_COUNT', maxOccurrences: 6 }, '12:00')).toBe('Monthly on day 28 at 12:00 (6 times total)');
  });

  it('calculates the next run date correctly for future and recurring schedules', () => {
    const fixedNow = new Date('2026-09-26T06:00:00.000Z').getTime();
    
    // Future non-recurring
    const futureDate = new Date('2026-10-01T09:00:00.000Z');
    const next1 = getNextRunDate(futureDate, null, fixedNow);
    expect(next1.getTime()).toBe(futureDate.getTime());

    // Daily recurring from today
    const dailyRule: RecurrenceRule = { frequency: 'DAILY', interval: 1, endType: 'NEVER' };
    const next2 = getNextRunDate('2026-09-26T09:00:00.000Z', dailyRule, fixedNow);
    expect(next2.getTime()).toBeGreaterThan(fixedNow);
  });

  describe('isScheduledViewItem Filter Rule', () => {
    const nowMs = new Date('2026-09-26T06:00:00.000Z').getTime();

    it('shows messages whose sending dates have not yet arrived', () => {
      const futureItem = {
        status: 'SCHEDULED',
        scheduledAt: '2026-09-30T08:00:00.000Z', // In the future
      };
      expect(isScheduledViewItem(futureItem, nowMs)).toBe(true);
    });

    it('shows paused messages even if originally set in the past (waiting for user action/reschedule)', () => {
      const pausedItem = {
        status: 'PAUSED',
        scheduledAt: '2026-09-20T08:00:00.000Z',
      };
      expect(isScheduledViewItem(pausedItem, nowMs)).toBe(true);
    });

    it('shows recurring messages even if original start was in the past (active recurring series)', () => {
      const recurringItem = {
        status: 'SCHEDULED',
        scheduledAt: '2026-09-20T08:00:00.000Z',
        isRecurring: true,
      };
      expect(isScheduledViewItem(recurringItem, nowMs)).toBe(true);
    });

    it('hides non-recurring messages whose sending dates have already passed (past due / expired / already sent)', () => {
      const pastNonRecurring = {
        status: 'SCHEDULED',
        scheduledAt: '2026-09-20T08:00:00.000Z', // 6 days in the past
        isRecurring: false,
      };
      expect(isScheduledViewItem(pastNonRecurring, nowMs)).toBe(false);
    });

    it('hides completed, cancelled, sent, or delivered messages from the active scheduled queue', () => {
      expect(isScheduledViewItem({ status: 'COMPLETED', scheduledAt: '2026-10-01T08:00:00.000Z' }, nowMs)).toBe(false);
      expect(isScheduledViewItem({ status: 'CANCELLED', scheduledAt: '2026-10-01T08:00:00.000Z' }, nowMs)).toBe(false);
      expect(isScheduledViewItem({ status: 'SENT', scheduledAt: '2026-10-01T08:00:00.000Z' }, nowMs)).toBe(false);
      expect(isScheduledViewItem({ status: 'DELIVERED', scheduledAt: '2026-10-01T08:00:00.000Z' }, nowMs)).toBe(false);
    });
  });
});
