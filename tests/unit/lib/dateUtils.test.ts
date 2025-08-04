import { formatLocalizedDate, timeAgo } from '@/lib/dateUtils';
import { es, enUS } from 'date-fns/locale';

describe('dateUtils', () => {
  // Mock console.error to prevent test logs from cluttering output
  let consoleErrorSpy: jest.SpyInstance;

  beforeAll(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    consoleErrorSpy.mockRestore();
  });

  describe('formatLocalizedDate', () => {
    it('should format a valid date string with default locale and format', () => {
      const dateString = '2025-01-15T10:00:00.000Z';
      const expected = '15/01/2025'; // Default format 'dd/MM/yyyy' and 'es' locale
      expect(formatLocalizedDate(dateString)).toBe(expected);
    });

    it('should format a valid date string with a custom format', () => {
      const dateString = '2025-01-15T10:00:00.000Z';
      const customFormat = 'MMMM dd, yyyy';
      const expected = 'enero 15, 2025'; // 'es' locale
      expect(formatLocalizedDate(dateString, es, customFormat)).toBe(expected);
    });

    it('should format a valid date string with a different locale', () => {
      const dateString = '2025-01-15T10:00:00.000Z';
      const customFormat = 'MMMM dd, yyyy';
      const expected = 'January 15, 2025'; // 'enUS' locale
      expect(formatLocalizedDate(dateString, enUS, customFormat)).toBe(expected);
    });

    it('should return an empty string for an empty date string', () => {
      expect(formatLocalizedDate('')).toBe('');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should return the original string and log an error for an invalid date string', () => {
      const invalidDateString = 'not-a-date';
      expect(formatLocalizedDate(invalidDateString)).toBe(invalidDateString);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error formatting date'),
        expect.any(Error)
      );
    });

    it('should handle null or undefined date strings gracefully', () => {
      expect(formatLocalizedDate(null as any)).toBe('');
      expect(formatLocalizedDate(undefined as any)).toBe('');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  });

  describe('timeAgo', () => {
    // Mock Date.now() to control the "current" time for consistent test results
    const MOCK_DATE = new Date('2025-01-15T12:00:00.000Z');
    const realDateNow = Date.now;

    beforeEach(() => {
      global.Date.now = jest.fn(() => MOCK_DATE.getTime());
    });

    afterEach(() => {
      global.Date.now = realDateNow;
    });

    it('should return "in 2 days" for a date 2 days in the future', () => {
      const futureDate = '2025-01-17T12:00:00.000Z';
      expect(timeAgo(futureDate)).toBe('en 2 días');
    });

    it('should return "2 days ago" for a date 2 days in the past', () => {
      const pastDate = '2025-01-13T12:00:00.000Z';
      expect(timeAgo(pastDate)).toBe('hace 2 días');
    });

    it('should return "in 1 hour" for a date 1 hour in the future', () => {
      const futureDate = '2025-01-15T13:00:00.000Z';
      expect(timeAgo(futureDate)).toBe('en 1 hora');
    });

    it('should return "1 hour ago" for a date 1 hour in the past', () => {
      const pastDate = '2025-01-15T11:00:00.000Z';
      expect(timeAgo(pastDate)).toBe('hace 1 hora');
    });

    it('should return "in 1 minute" for a date 1 minute in the future', () => {
      const futureDate = '2025-01-15T12:01:00.000Z';
      expect(timeAgo(futureDate)).toBe('en 1 minuto');
    });

    it('should return "1 minute ago" for a date 1 minute in the past', () => {
      const pastDate = '2025-01-15T11:59:00.000Z';
      expect(timeAgo(pastDate)).toBe('hace 1 minuto');
    });

    it('should return "in 1 second" for a date in the very near future', () => {
      const futureDate = '2025-01-15T12:00:01.000Z';
      expect(timeAgo(futureDate)).toBe('en 1 segundo');
    });

    it('should return "1 second ago" for a date in the very near past', () => {
      const pastDate = '2025-01-15T11:59:59.000Z';
      expect(timeAgo(pastDate)).toBe('hace 1 segundo');
    });

    it('should return "0 seconds ago" for the current date', () => {
      const currentDate = '2025-01-15T12:00:00.000Z';
      expect(timeAgo(currentDate)).toBe('hace 0 segundos');
    });

    it('should return an empty string for an empty date string', () => {
      expect(timeAgo('')).toBe('');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should return the original string and log an error for an invalid date string', () => {
      const invalidDateString = 'not-a-date';
      expect(timeAgo(invalidDateString)).toBe(invalidDateString);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error calculating time ago'),
        expect.any(Error)
      );
    });

    it('should handle null or undefined date strings gracefully', () => {
      expect(timeAgo(null as any)).toBe('');
      expect(timeAgo(undefined as any)).toBe('');
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it('should format time ago with a different locale', () => {
      const pastDate = '2025-01-13T12:00:00.000Z';
      expect(timeAgo(pastDate, enUS)).toBe('2 days ago');
    });
  });
});
