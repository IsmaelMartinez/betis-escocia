import { describe, it, expect } from 'vitest';

// Simple string utility functions for testing
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

const truncate = (str: string, length: number): string => {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
};

const removeAccents = (str: string): string => {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const formatSpanishText = (text: string): string => {
  // Common Spanish text formatting
  return text
    .replace(/\bbetis\b/gi, 'Betis')
    .replace(/\breal betis\b/gi, 'Real Betis')
    .replace(/\bescocia\b/gi, 'Escocia')
    .replace(/\bedimburgo\b/gi, 'Edimburgo');
};

describe('String Utilities', () => {
  it('should capitalize first letter', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('HELLO')).toBe('Hello');
    expect(capitalize('hELLO')).toBe('Hello');
  });

  it('should handle empty strings', () => {
    expect(capitalize('')).toBe('');
  });

  it('should create slugs from strings', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify('Hello, World!')).toBe('hello-world');
    expect(slugify('  Multiple   Spaces  ')).toBe('multiple-spaces');
  });

  it('should handle special characters in slugs', () => {
    expect(slugify('Peña Bética')).toBe('pea-btica');
    expect(slugify('Real Betis & More')).toBe('real-betis-more');
  });

  it('should truncate long strings', () => {
    const longText = 'This is a very long text that should be truncated';
    expect(truncate(longText, 20)).toBe('This is a very long ...');
    expect(truncate('Short', 20)).toBe('Short');
  });

  it('should remove accents from Spanish text', () => {
    expect(removeAccents('José María')).toBe('Jose Maria');
    expect(removeAccents('Peña Bética')).toBe('Pena Betica');
    expect(removeAccents('Clasificación')).toBe('Clasificacion');
  });

  it('should validate email addresses', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('test.email@domain.co.uk')).toBe(true);
    expect(isValidEmail('invalid.email')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
  });

  it('should format Spanish text correctly', () => {
    expect(formatSpanishText('real betis is the best')).toBe('Real Betis is the best');
    expect(formatSpanishText('We are in escocia')).toBe('We are in Escocia');
    expect(formatSpanishText('Living in edimburgo')).toBe('Living in Edimburgo');
  });

  it('should handle mixed case in formatting', () => {
    expect(formatSpanishText('REAL BETIS vs betis')).toBe('Real Betis vs Betis');
  });

  it('should preserve other text when formatting', () => {
    const text = 'We support betis in escocia, specifically edimburgo!';
    const expected = 'We support Betis in Escocia, specifically Edimburgo!';
    expect(formatSpanishText(text)).toBe(expected);
  });
});