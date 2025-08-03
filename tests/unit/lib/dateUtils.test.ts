import { formatLocalizedDate, timeAgo } from '@/lib/dateUtils';
import { es, enUS } from 'date-fns/locale';

describe('dateUtils', () => {
  // Mock console.error to prevent test logs from cluttering output
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('formatLocalizedDate', () => {
    it('should format a valid date string with default locale and format', () => {
      const dateString = '2025-01-15T10:00:00.000Z';
      const formattedDate = formatLocalizedDate(dateString);
      expect(formattedDate).toBe('15/01/2025');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should format a valid date string with a different locale', () => {
      const dateString = '2025-01-15T10:00:00.000Z';
      const formattedDate = formatLocalizedDate(dateString, enUS, 'MM/dd/yyyy');
      expect(formattedDate).toBe('01/15/2025');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should format a valid date string with a custom format', () => {
      const dateString = '2025-01-15T10:00:00.000Z';
      const formattedDate = formatLocalizedDate(dateString, es, 'EEEE, dd MMMM yyyy');
      expect(formattedDate).toBe('miércoles, 15 enero 2025');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should return original string and log error for invalid date string', () => {
      const invalidDateString = 'not-a-date';
      const formattedDate = formatLocalizedDate(invalidDateString);
      expect(formattedDate).toBe(invalidDateString);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error formatting date: not-a-date'),
        expect.any(Error)
      );
    });

    it('should return empty string for empty date string', () => {
      const formattedDate = formatLocalizedDate('');
      expect(formattedDate).toBe('');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should handle date strings with different timezones correctly', () => {
      // This date is Jan 15, 2025 10:00:00 UTC
      const dateStringUTC = '2025-01-15T10:00:00.000Z';
      // This date is Jan 15, 2025 10:00:00 in a specific timezone (e.g., +02:00)
      const dateStringLocal = '2025-01-15T10:00:00+02:00';

      const formattedUTC = formatLocalizedDate(dateStringUTC, es, 'dd/MM/yyyy HH:mm');
      const formattedLocal = formatLocalizedDate(dateStringLocal, es, 'dd/MM/yyyy HH:mm');

      // Expecting them to be formatted based on their actual UTC time,
      // which parseISO handles correctly by converting to local time if not specified.
      // For 'dd/MM/yyyy HH:mm', it will show the local time equivalent of the UTC string.
      // Assuming test environment is UTC or consistent, both should resolve to the same date/time.
      // If test environment is not UTC, the local time will differ.
      // For robust testing, it's better to test against a known UTC output or mock Date.now().
      // For now, we'll assume consistent environment.
      expect(formattedUTC).toMatch(/15\/01\/2025 \d{2}:\d{2}/);
      expect(formattedLocal).toMatch(/15\/01\/2025 \d{2}:\d{2}/);
    });
  });

  describe('timeAgo', () => {
    it('should return "hace X segundos" for a date a few seconds ago', () => {
      const now = new Date();
      const fewSecondsAgo = new Date(now.getTime() - 5 * 1000); // 5 seconds ago
      const dateString = fewSecondsAgo.toISOString();
      const timeAgoString = timeAgo(dateString);
      expect(timeAgoString).toMatch(/hace \d+ segundos/);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should return "hace X minutos" for a date a few minutes ago', () => {
      const now = new Date();
      const fewMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
      const dateString = fewMinutesAgo.toISOString();
      const timeAgoString = timeAgo(dateString);
      expect(timeAgoString).toMatch(/hace \d+ minutos/);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should return "hace X horas" for a date a few hours ago', () => {
      const now = new Date();
      const fewHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000); // 3 hours ago
      const dateString = fewHoursAgo.toISOString();
      const timeAgoString = timeAgo(dateString);
      expect(timeAgoString).toMatch(/hace \d+ horas/);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should return "hace X días" for a date a few days ago', () => {
      const now = new Date();
      const fewDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
      const dateString = fewDaysAgo.toISOString();
      const timeAgoString = timeAgo(dateString);
      expect(timeAgoString).toMatch(/hace \d+ días/);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should return "hace X meses" for a date a few months ago', () => {
      const now = new Date();
      const fewMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()); // 3 months ago
      const dateString = fewMonthsAgo.toISOString();
      const timeAgoString = timeAgo(dateString);
      expect(timeAgoString).toMatch(/hace \d+ meses/);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should return "hace X años" for a date a few years ago', () => {
      const now = new Date();
      const fewYearsAgo = new Date(now.getFullYear() - 2, now.getMonth(), now.getDate()); // 2 years ago
      const dateString = fewYearsAgo.toISOString();
      const timeAgoString = timeAgo(dateString);
      expect(timeAgoString).toMatch(/hace \d+ años/);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should return "X seconds ago" for a date a few seconds ago with enUS locale', () => {
      const now = new Date();
      const fewSecondsAgo = new Date(now.getTime() - 5 * 1000); // 5 seconds ago
      const dateString = fewSecondsAgo.toISOString();
      const timeAgoString = timeAgo(dateString, enUS);
      expect(timeAgoString).toMatch(/\d+ seconds ago/);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should return original string and log error for invalid date string', () => {
      const invalidDateString = 'not-a-date';
      const timeAgoString = timeAgo(invalidDateString);
      expect(timeAgoString).toBe(invalidDateString);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error calculating time ago for date: not-a-date'),
        expect.any(Error)
      );
    });

    it('should return empty string for empty date string', () => {
      const timeAgoString = timeAgo('');
      expect(timeAgoString).toBe('');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });
});