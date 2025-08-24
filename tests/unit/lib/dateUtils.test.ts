import { describe, it, expect } from 'vitest';

// Simple date utility functions for testing
const formatDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

describe('Date Utilities', () => {
  it('should format date in Spanish locale', () => {
    const date = new Date('2024-01-15T10:30:00Z');
    const formatted = formatDate(date);
    expect(formatted).toContain('2024');
  });

  it('should validate valid dates', () => {
    const validDate = new Date('2024-01-15');
    expect(isValidDate(validDate)).toBe(true);
  });

  it('should invalidate invalid dates', () => {
    const invalidDate = new Date('invalid');
    expect(isValidDate(invalidDate)).toBe(false);
  });

  it('should format time correctly', () => {
    const date = new Date('2024-01-15T14:30:00Z');
    const formatted = formatTime(date);
    expect(formatted).toMatch(/\d{1,2}:\d{2}/);
  });

  it('should add days to date', () => {
    const date = new Date('2024-01-15');
    const future = addDays(date, 5);
    expect(future.getDate()).toBe(20);
  });

  it('should subtract days from date', () => {
    const date = new Date('2024-01-15');
    const past = addDays(date, -5);
    expect(past.getDate()).toBe(10);
  });

  it('should check if date is today', () => {
    const today = new Date();
    expect(isToday(today)).toBe(true);
  });

  it('should check if date is not today', () => {
    const yesterday = addDays(new Date(), -1);
    expect(isToday(yesterday)).toBe(false);
  });

  it('should handle month boundaries when adding days', () => {
    const endOfMonth = new Date('2024-01-31');
    const nextMonth = addDays(endOfMonth, 1);
    expect(nextMonth.getMonth()).toBe(1); // February (0-indexed)
  });

  it('should handle year boundaries when adding days', () => {
    const endOfYear = new Date('2023-12-31');
    const nextYear = addDays(endOfYear, 1);
    expect(nextYear.getFullYear()).toBe(2024);
  });
});