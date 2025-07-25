// Jest setup file for global test configuration
import '@testing-library/jest-dom';

// Suppress console errors and warnings during tests
// This prevents test error scenarios from cluttering the output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
