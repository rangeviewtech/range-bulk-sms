import { format, formatDistanceToNow, isPast, isFuture, differenceInDays } from 'date-fns';
import { formatDateTz, formatDateTimeTz } from '@/lib/timezone';

/**
 * Format a date string. Now timezone-aware — uses the client's detected timezone.
 * If no timezone is needed or for backward-compat, falls back to Intl-based formatting.
 */
export const formatDate = (date: Date | number | string, formatStr = 'MMM dd, yyyy', timeZone?: string): string => {
  if (formatStr === 'MMM dd, yyyy' && !timeZone) {
    // Use timezone-aware formatting by default
    return formatDateTz(date);
  }
  // For custom format strings, fall back to date-fns (system local time)
  return format(new Date(date), formatStr);
};

/**
 * Format date + time. Now timezone-aware.
 */
export const formatDateTime = (date: Date | number | string, timeZone?: string): string => {
  return formatDateTimeTz(date, timeZone);
};

/**
 * Relative date formatting (e.g. "3 hours ago", "in 2 days").
 * This is timezone-agnostic since it calculates the difference from "now".
 */
export const formatRelativeDate = (date: Date | number | string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDateRange = (startDate: Date | number | string, endDate: Date | number | string): string => {
  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
};

export const isDateInPast = (date: Date | number | string): boolean => {
  return isPast(new Date(date));
};

export const isDateInFuture = (date: Date | number | string): boolean => {
  return isFuture(new Date(date));
};

export const getDateDifference = (dateLeft: Date | number | string, dateRight: Date | number | string): number => {
  return differenceInDays(new Date(dateLeft), new Date(dateRight));
};
