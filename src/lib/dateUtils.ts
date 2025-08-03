import { format, formatDistanceToNowStrict, parseISO, Locale } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formats a date string into a localized date string using date-fns.
 * @param dateString The date string to format (e.g., '2025-12-25T19:00:00.000Z').
 * @param locale The locale to use for formatting (e.g., 'es'). Defaults to 'es'.
 * @param dateFormat The date format string (e.g., 'dd/MM/yyyy'). Defaults to 'dd/MM/yyyy'.
 * @returns The formatted date string.
 */
export function formatLocalizedDate(dateString: string, locale: Locale = es, dateFormat: string = 'dd/MM/yyyy'): string {
  if (!dateString) {
    return '';
  }
  try {
    const date = parseISO(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }
    return format(date, dateFormat, { locale });
  } catch (error) {
    console.error(`Error formatting date: ${dateString}`, error);
    return dateString; // Return original string on error
  }
}

/**
 * Calculates the time elapsed since a given date string in a human-readable format using date-fns.
 * @param dateString The date string to calculate time from.
 * @param locale The locale to use for formatting (e.g., 'es'). Defaults to 'es'.
 * @returns A string representing the time ago (e.g., '2 days ago', '3 hours ago').
 */
export function timeAgo(dateString: string, locale: Locale = es): string {
  if (!dateString) {
    return '';
  }
  try {
    const date = parseISO(dateString);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date string");
    }
    return formatDistanceToNowStrict(date, { addSuffix: true, locale });
  } catch (error) {
    console.error(`Error calculating time ago for date: ${dateString}`, error);
    return dateString; // Return original string on error
  }
}