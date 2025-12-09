import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

export const formatWaitTime = (minutes: number): string => {
  if (minutes < 1) {
    return 'Less than a minute';
  }
  if (minutes < 60) {
    return `${Math.round(minutes)} min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
};

const toDate = (date: any): Date => {
  if (!date) return new Date();
  if (date instanceof Date) return date;
  if (date.toDate && typeof date.toDate === 'function') return date.toDate();
  if (date.seconds) return new Date(date.seconds * 1000);
  return new Date(date);
};

export const formatDateTime = (date: Date | any): string => {
  const d = toDate(date);
  if (isToday(d)) {
    return `Today at ${format(d, 'h:mm a')}`;
  }
  if (isYesterday(d)) {
    return `Yesterday at ${format(d, 'h:mm a')}`;
  }
  return format(d, 'MMM d, yyyy h:mm a');
};

export const formatRelativeTime = (date: Date | any): string => {
  const d = toDate(date);
  return formatDistanceToNow(d, { addSuffix: true });
};