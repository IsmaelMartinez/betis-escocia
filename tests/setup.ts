// Jest setup file for global test configuration
import '@testing-library/jest-dom';

// Polyfill for Request and Response objects for Next.js API route testing
// This is necessary because NextRequest and NextResponse extend these Web APIs
if (typeof globalThis.Request === 'undefined') {
  globalThis.Request = require('node-fetch').Request;
}
if (typeof globalThis.Response === 'undefined') {
  globalThis.Response = require('node-fetch').Response;
}

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