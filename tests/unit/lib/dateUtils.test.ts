import { formatLocalizedDate, timeAgo } from "@/lib/dateUtils";
import { es, enUS } from 'date-fns/locale';

describe("dateUtils", () => {
  describe("formatLocalizedDate", () => {
    it("should format a date string to a localized date string (es-ES)", () => {
      const dateString = "2025-01-15T10:00:00.000Z";
      expect(formatLocalizedDate(dateString, es)).toBe("15/01/2025");
    });

    it("should format a date string to a localized date string (en-US) with MM/dd/yyyy format", () => {
      const dateString = "2025-01-15T10:00:00.000Z";
      expect(formatLocalizedDate(dateString, enUS, "MM/dd/yyyy")).toBe("01/15/2025");
    });

    it("should format a date string with custom format", () => {
      const dateString = "2025-01-15T10:00:00.000Z";
      expect(formatLocalizedDate(dateString, es, "dd MMMM yyyy")).toBe("15 enero 2025");
    });

    it("should return an empty string if dateString is empty", () => {
      expect(formatLocalizedDate("")).toBe("");
    });

    it("should return the original string and log an error for invalid date strings", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const invalidDateString = "invalid-date";
      expect(formatLocalizedDate(invalidDateString)).toBe(invalidDateString);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error formatting date: ${invalidDateString}`,
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });

  describe("timeAgo", () => {
    const MOCK_NOW = new Date("2025-08-01T12:00:00.000Z");

    beforeAll(() => {
      jest.useFakeTimers();
      jest.setSystemTime(MOCK_NOW);
    });

    afterAll(() => {
      jest.useRealTimers();
    });

    it("should return '5 seconds ago' for a date within seconds", () => {
      const date = new Date(MOCK_NOW.getTime() - 5 * 1000); // 5 seconds ago
      expect(timeAgo(date.toISOString(), enUS)).toBe("5 seconds ago");
    });

    it("should return '1 minute ago' for a date 60 seconds ago", () => {
      const date = new Date(MOCK_NOW.getTime() - 60 * 1000); // 1 minute ago
      expect(timeAgo(date.toISOString(), enUS)).toBe("1 minute ago");
    });

    it("should return 'X minutes ago' for a date several minutes ago", () => {
      const date = new Date(MOCK_NOW.getTime() - 5 * 60 * 1000); // 5 minutes ago
      expect(timeAgo(date.toISOString(), enUS)).toBe("5 minutes ago");
    });

    it("should return '1 hour ago' for a date 60 minutes ago", () => {
      const date = new Date(MOCK_NOW.getTime() - 60 * 60 * 1000); // 1 hour ago
      expect(timeAgo(date.toISOString(), enUS)).toBe("1 hour ago");
    });

    it("should return 'X hours ago' for a date several hours ago", () => {
      const date = new Date(MOCK_NOW.getTime() - 5 * 60 * 60 * 1000); // 5 hours ago
      expect(timeAgo(date.toISOString(), enUS)).toBe("5 hours ago");
    });

    it("should return '1 day ago' for a date 24 hours ago", () => {
      const date = new Date(MOCK_NOW.getTime() - 24 * 60 * 60 * 1000); // 1 day ago
      expect(timeAgo(date.toISOString(), enUS)).toBe("1 day ago");
    });

    it("should return 'X days ago' for a date several days ago", () => {
      const date = new Date(MOCK_NOW.getTime() - 5 * 24 * 60 * 60 * 1000); // 5 days ago
      expect(timeAgo(date.toISOString(), enUS)).toBe("5 days ago");
    });

    it("should return '1 month ago' for a date 30 days ago", () => {
      const date = new Date(MOCK_NOW.getTime() - 30 * 24 * 60 * 60 * 1000); // 1 month ago (approx)
      expect(timeAgo(date.toISOString(), enUS)).toBe("1 month ago");
    });

    it("should return 'X months ago' for a date several months ago", () => {
      const date = new Date(MOCK_NOW.getTime() - 3 * 30 * 24 * 60 * 60 * 1000); // 3 months ago (approx)
      expect(timeAgo(date.toISOString(), enUS)).toBe("3 months ago");
    });

    it("should return '1 year ago' for a date 365 days ago", () => {
      const date = new Date(MOCK_NOW.getTime() - 365 * 24 * 60 * 60 * 1000); // 1 year ago (approx)
      expect(timeAgo(date.toISOString(), enUS)).toBe("1 year ago");
    });

    it("should return 'X years ago' for a date several years ago", () => {
      const date = new Date(MOCK_NOW.getTime() - 2 * 365 * 24 * 60 * 60 * 1000); // 2 years ago (approx)
      expect(timeAgo(date.toISOString(), enUS)).toBe("2 years ago");
    });

    it("should return the original string and log an error for invalid date strings", () => {
      const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
      const invalidDateString = "invalid-date";
      expect(timeAgo(invalidDateString)).toBe(invalidDateString);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Error calculating time ago for date: ${invalidDateString}`,
        expect.any(Error)
      );
      consoleErrorSpy.mockRestore();
    });
  });
});
