// src/utils/date.ts

/**
 * Formats a standard ISO date string to a human-readable date.
 * @param dateString ISO string (e.g., "2024-03-15T10:00:00Z")
 * @returns Formatted date (e.g., "Mar 15, 2024")
 */
export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
};

/**
 * Formats a standard ISO date string to a human-readable date and time.
 * @param dateString ISO string
 * @returns Formatted date and time (e.g., "Mar 15, 2024, 10:00 AM")
 */
export const formatDateTime = (dateString: string): string => {
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(dateString));
};