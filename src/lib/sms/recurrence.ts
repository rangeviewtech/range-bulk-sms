/**
 * Recurring SMS Scheduling & Recurrence Engine
 * 
 * Supports standard enterprise recurrence patterns:
 * - Daily, Weekdays (Mon-Fri), Weekly, Bi-weekly, Monthly, Yearly
 * - Custom days of week selection (e.g. Mon, Wed, Fri)
 * - End conditions: Never, On specific date, After N occurrences
 * - Standard 5-part cron expression generation & parsing
 * - Accurate next run calculation and human-readable formatting
 */

export type RecurrenceFrequency = 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'YEARLY';

export type RecurrenceEndType = 'NEVER' | 'ON_DATE' | 'AFTER_COUNT';

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval?: number; // e.g. every 1 week, every 2 weeks
  daysOfWeek?: number[]; // 0 = Sun, 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri, 6 = Sat
  dayOfMonth?: number; // 1 - 31
  endType: RecurrenceEndType;
  endDate?: string; // YYYY-MM-DD
  maxOccurrences?: number;
  occurrencesCompleted?: number;
}

export const DAY_NAMES_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
export const DAY_NAMES_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/**
 * Builds standard 5-part cron expression from recurrence rule & time string (HH:mm)
 */
export function buildCronExpression(rule: RecurrenceRule, timeStr = '09:00'): string {
  const [hourStr = '9', minStr = '0'] = timeStr.split(':');
  const minute = parseInt(minStr, 10) || 0;
  const hour = parseInt(hourStr, 10) || 0;
  const interval = Math.max(1, rule.interval || 1);

  switch (rule.frequency) {
    case 'DAILY':
      return interval > 1 ? `${minute} ${hour} */${interval} * *` : `${minute} ${hour} * * *`;

    case 'WEEKDAYS':
      return `${minute} ${hour} * * 1-5`;

    case 'WEEKLY':
    case 'BIWEEKLY': {
      const days = rule.daysOfWeek && rule.daysOfWeek.length > 0
        ? [...rule.daysOfWeek].sort((a, b) => a - b).join(',')
        : '1'; // Default Monday
      return `${minute} ${hour} * * ${days}`;
    }

    case 'MONTHLY': {
      const day = rule.dayOfMonth && rule.dayOfMonth >= 1 && rule.dayOfMonth <= 31 ? rule.dayOfMonth : 1;
      return interval > 1 ? `${minute} ${hour} ${day} */${interval} *` : `${minute} ${hour} ${day} * *`;
    }

    case 'YEARLY': {
      const day = rule.dayOfMonth && rule.dayOfMonth >= 1 && rule.dayOfMonth <= 31 ? rule.dayOfMonth : 1;
      return `${minute} ${hour} ${day} 1 *`;
    }

    default:
      return `${minute} ${hour} * * *`;
  }
}

/**
 * Encodes RecurrenceRule into string format suitable for cronExpression or JSON storage
 */
export function serializeRecurrence(rule: RecurrenceRule, timeStr = '09:00'): string {
  const cron = buildCronExpression(rule, timeStr);
  return JSON.stringify({
    cron,
    frequency: rule.frequency,
    interval: rule.interval || 1,
    daysOfWeek: rule.daysOfWeek,
    dayOfMonth: rule.dayOfMonth,
    endType: rule.endType,
    endDate: rule.endDate,
    maxOccurrences: rule.maxOccurrences,
    occurrencesCompleted: rule.occurrencesCompleted || 0,
  });
}

/**
 * Parses RecurrenceRule from serialized string or standard cron string
 */
export function parseRecurrence(serializedOrCron?: string | null): RecurrenceRule {
  if (!serializedOrCron) {
    return {
      frequency: 'DAILY',
      interval: 1,
      endType: 'NEVER',
    };
  }

  // Check if JSON serialized
  if (serializedOrCron.startsWith('{')) {
    try {
      const parsed = JSON.parse(serializedOrCron);
      return {
        frequency: parsed.frequency || 'DAILY',
        interval: parsed.interval || 1,
        daysOfWeek: Array.isArray(parsed.daysOfWeek) ? parsed.daysOfWeek : undefined,
        dayOfMonth: typeof parsed.dayOfMonth === 'number' ? parsed.dayOfMonth : undefined,
        endType: parsed.endType || 'NEVER',
        endDate: parsed.endDate,
        maxOccurrences: parsed.maxOccurrences,
        occurrencesCompleted: parsed.occurrencesCompleted || 0,
      };
    } catch {
      // Fallback to cron parsing
    }
  }

  // Fallback: parse 5-part cron string e.g. "0 9 * * 1-5"
  const parts = serializedOrCron.trim().split(/\s+/);
  if (parts.length >= 5) {
    const dayOfWeek = parts[4];
    const dayOfMonth = parts[2];

    if (dayOfWeek === '1-5') {
      return { frequency: 'WEEKDAYS', interval: 1, endType: 'NEVER' };
    }

    if (dayOfWeek !== '*') {
      const days = dayOfWeek.split(',').map((d) => parseInt(d, 10)).filter((n) => !isNaN(n));
      return { frequency: 'WEEKLY', interval: 1, daysOfWeek: days, endType: 'NEVER' };
    }

    if (dayOfMonth !== '*') {
      const day = parseInt(dayOfMonth, 10);
      return { frequency: 'MONTHLY', interval: 1, dayOfMonth: isNaN(day) ? 1 : day, endType: 'NEVER' };
    }
  }

  return { frequency: 'DAILY', interval: 1, endType: 'NEVER' };
}

/**
 * Generates human-friendly text describing the recurrence schedule
 */
export function describeRecurrence(ruleOrString?: RecurrenceRule | string | null, timeStr?: string): string {
  if (!ruleOrString) return 'Recurring';
  const rule: RecurrenceRule = typeof ruleOrString === 'string' ? parseRecurrence(ruleOrString) : ruleOrString;

  let freqText = '';
  const interval = rule.interval || 1;

  switch (rule.frequency) {
    case 'DAILY':
      freqText = interval > 1 ? `Every ${interval} days` : 'Daily';
      break;

    case 'WEEKDAYS':
      freqText = 'Every weekday (Mon–Fri)';
      break;

    case 'WEEKLY': {
      if (rule.daysOfWeek && rule.daysOfWeek.length > 0) {
        const days = rule.daysOfWeek.map((d) => DAY_NAMES_SHORT[d]).join(', ');
        freqText = interval > 1 ? `Every ${interval} weeks on ${days}` : `Weekly on ${days}`;
      } else {
        freqText = interval > 1 ? `Every ${interval} weeks` : 'Weekly';
      }
      break;
    }

    case 'BIWEEKLY':
      freqText = 'Every 2 weeks';
      break;

    case 'MONTHLY': {
      const day = rule.dayOfMonth ? `on day ${rule.dayOfMonth}` : 'monthly';
      freqText = interval > 1 ? `Every ${interval} months ${day}` : `Monthly ${day}`;
      break;
    }

    case 'YEARLY':
      freqText = 'Yearly';
      break;

    default:
      freqText = 'Recurring';
  }

  let fullDesc = freqText;
  if (timeStr) {
    fullDesc += ` at ${timeStr}`;
  }

  if (rule.endType === 'ON_DATE' && rule.endDate) {
    fullDesc += ` until ${rule.endDate}`;
  } else if (rule.endType === 'AFTER_COUNT' && rule.maxOccurrences) {
    fullDesc += ` (${rule.maxOccurrences} times total)`;
  }

  return fullDesc;
}

/**
 * Calculates next upcoming run time from a starting date & recurrence rule
 */
export function getNextRunDate(startDate: Date | string, rule?: RecurrenceRule | null, fromTimeMs = Date.now()): Date {
  const start = new Date(startDate);
  if (isNaN(start.getTime())) return new Date(fromTimeMs + 24 * 60 * 60 * 1000);

  if (!rule) {
    return start;
  }

  // If start is in future, start is the first run
  if (start.getTime() > fromTimeMs) {
    return start;
  }

  const hours = start.getHours();
  const minutes = start.getMinutes();
  const next = new Date(fromTimeMs);
  next.setHours(hours, minutes, 0, 0);

  // If today's time has already passed, advance to tomorrow as baseline
  if (next.getTime() <= fromTimeMs) {
    next.setDate(next.getDate() + 1);
  }

  switch (rule.frequency) {
    case 'DAILY': {
      const interval = Math.max(1, rule.interval || 1);
      if (interval > 1) {
        const diffDays = Math.ceil((next.getTime() - start.getTime()) / (24 * 3600 * 1000));
        const rem = diffDays % interval;
        if (rem !== 0) {
          next.setDate(next.getDate() + (interval - rem));
        }
      }
      return next;
    }

    case 'WEEKDAYS': {
      while (next.getDay() === 0 || next.getDay() === 6) {
        next.setDate(next.getDate() + 1);
      }
      return next;
    }

    case 'WEEKLY': {
      const targetDays = rule.daysOfWeek && rule.daysOfWeek.length > 0 ? rule.daysOfWeek : [start.getDay()];
      for (let i = 0; i < 14; i++) {
        if (targetDays.includes(next.getDay()) && next.getTime() > fromTimeMs) {
          return next;
        }
        next.setDate(next.getDate() + 1);
      }
      return next;
    }

    case 'BIWEEKLY': {
      next.setDate(next.getDate() + 14);
      return next;
    }

    case 'MONTHLY': {
      const targetDay = rule.dayOfMonth || start.getDate();
      next.setDate(targetDay);
      if (next.getTime() <= fromTimeMs) {
        next.setMonth(next.getMonth() + 1);
        next.setDate(targetDay);
      }
      return next;
    }

    case 'YEARLY': {
      next.setFullYear(next.getFullYear() + 1);
      return next;
    }

    default:
      return next;
  }
}

/**
 * Filters scheduled messages for the scheduled view:
 * Shows ONLY:
 * 1. Messages that are unsent whose sending dates have not yet arrived (scheduledAt > nowMs)
 * 2. Paused messages (can be edited/resumed)
 * 3. Recurring messages (repeat continuously)
 */
export function isScheduledViewItem(
  item: {
    status: string;
    scheduledAt: string;
    isRecurring?: boolean;
    cancelledAt?: string | null;
    executedAt?: string | null;
  },
  nowMs = Date.now()
): boolean {
  // If explicitly cancelled, completed, or delivered, do not show in active scheduled queue
  if (item.status === 'CANCELLED' || item.status === 'COMPLETED' || item.status === 'SENT' || item.status === 'DELIVERED') {
    return false;
  }

  // Paused messages always stay in view
  if (item.status === 'PAUSED') {
    return true;
  }

  // Recurring messages always stay in view (they trigger future recurring occurrences)
  if (item.isRecurring) {
    return true;
  }

  // For non-recurring scheduled messages: show only if scheduled date has not yet arrived
  const scheduledTimeMs = new Date(item.scheduledAt).getTime();
  if (isNaN(scheduledTimeMs)) return false;

  return scheduledTimeMs > nowMs;
}
