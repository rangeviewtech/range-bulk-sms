import { format, formatDistanceToNow, isPast, isFuture, differenceInDays } from 'date-fns';

export const formatDate = (date: Date | number | string, formatStr = 'MMM dd, yyyy'): string => {
  return format(new Date(date), formatStr);
};

export const formatDateTime = (date: Date | number | string): string => {
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

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
