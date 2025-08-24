import { describe, it, expect } from 'vitest';

// Simple math utility functions for testing
const percentage = (value: number, total: number): number => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

const average = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  return numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
};

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

const roundToDecimals = (value: number, decimals: number): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
};

const isEven = (num: number): boolean => {
  return num % 2 === 0;
};

const sum = (numbers: number[]): number => {
  return numbers.reduce((total, num) => total + num, 0);
};

const max = (numbers: number[]): number => {
  return Math.max(...numbers);
};

const min = (numbers: number[]): number => {
  return Math.min(...numbers);
};

describe('Math Utilities', () => {
  it('should calculate percentages correctly', () => {
    expect(percentage(25, 100)).toBe(25);
    expect(percentage(1, 3)).toBe(33); // Rounded
    expect(percentage(2, 3)).toBe(67); // Rounded
  });

  it('should handle zero total in percentage', () => {
    expect(percentage(5, 0)).toBe(0);
  });

  it('should calculate average of numbers', () => {
    expect(average([1, 2, 3, 4, 5])).toBe(3);
    expect(average([10, 20])).toBe(15);
  });

  it('should handle empty array in average', () => {
    expect(average([])).toBe(0);
  });

  it('should clamp values within bounds', () => {
    expect(clamp(5, 1, 10)).toBe(5);
    expect(clamp(15, 1, 10)).toBe(10);
    expect(clamp(-5, 1, 10)).toBe(1);
  });

  it('should generate random integers in range', () => {
    const random = randomInt(1, 5);
    expect(random).toBeGreaterThanOrEqual(1);
    expect(random).toBeLessThanOrEqual(5);
    expect(Number.isInteger(random)).toBe(true);
  });

  it('should round to specified decimal places', () => {
    expect(roundToDecimals(3.14159, 2)).toBe(3.14);
    expect(roundToDecimals(3.14159, 0)).toBe(3);
    expect(roundToDecimals(3.999, 1)).toBe(4);
  });

  it('should check if number is even', () => {
    expect(isEven(2)).toBe(true);
    expect(isEven(3)).toBe(false);
    expect(isEven(0)).toBe(true);
    expect(isEven(-2)).toBe(true);
    expect(isEven(-3)).toBe(false);
  });

  it('should calculate sum of numbers', () => {
    expect(sum([1, 2, 3, 4, 5])).toBe(15);
    expect(sum([])).toBe(0);
    expect(sum([10])).toBe(10);
  });

  it('should find maximum number', () => {
    expect(max([1, 5, 3, 9, 2])).toBe(9);
    expect(max([-1, -5, -3])).toBe(-1);
  });

  it('should find minimum number', () => {
    expect(min([1, 5, 3, 9, 2])).toBe(1);
    expect(min([-1, -5, -3])).toBe(-5);
  });

  it('should handle edge cases for min/max with single element', () => {
    expect(max([42])).toBe(42);
    expect(min([42])).toBe(42);
  });
});