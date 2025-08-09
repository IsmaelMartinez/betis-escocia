// Jest setup file for global test configuration
/* eslint-disable */
import '@testing-library/jest-dom';

// Polyfill for various web APIs that are not available in the Node.js environment
// but are expected by libraries like 'undici' and 'msw'.
// These must be set on the global object BEFORE the libraries are imported.

const g: any = globalThis as any;

// 1. TextEncoder/TextDecoder
const { TextEncoder, TextDecoder } = require('util');
if (typeof g.TextEncoder === 'undefined') {
  g.TextEncoder = TextEncoder;
}
if (typeof g.TextDecoder === 'undefined') {
  g.TextDecoder = TextDecoder;
}

// 2. Web Streams API
const webStreams = require('stream/web');
if (typeof g.ReadableStream === 'undefined' && webStreams?.ReadableStream) {
  g.ReadableStream = webStreams.ReadableStream;
}
if (typeof g.WritableStream === 'undefined' && webStreams?.WritableStream) {
  g.WritableStream = webStreams.WritableStream;
}
if (typeof g.TransformStream === 'undefined' && webStreams?.TransformStream) {
  g.TransformStream = webStreams.TransformStream;
}

// 3. MessagePort/MessageChannel (for undici) and BroadcastChannel (for msw)
// These are available in 'worker_threads' in Node.js
try {
  const { MessagePort, MessageChannel, BroadcastChannel } = require('worker_threads');
  if (typeof g.MessagePort === 'undefined' && MessagePort) {
    g.MessagePort = MessagePort;
  }
  if (typeof g.MessageChannel === 'undefined' && MessageChannel) {
    g.MessageChannel = MessageChannel;
  }
  if (typeof g.BroadcastChannel === 'undefined' && BroadcastChannel) {
    g.BroadcastChannel = BroadcastChannel;
  }
} catch {}

// 4. Request/Response (from undici)
const undici = require('undici');
if (typeof g.Request === 'undefined' && typeof undici.Request === 'function') {
  g.Request = undici.Request;
}
if (typeof g.Response === 'undefined' && typeof undici.Response === 'function') {
  g.Response = undici.Response;
}
if (typeof g.fetch === 'undefined' && typeof undici.fetch === 'function') {
  g.fetch = undici.fetch;
}
if (typeof g.Headers === 'undefined' && typeof undici.Headers === 'function') {
  g.Headers = undici.Headers;
}


// Now that all polyfills are in place, import the MSW server
const { server } = require('./msw/server');

// Suppress console errors and warnings during tests
// This prevents test error scenarios from cluttering the output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Start MSW to intercept external network calls in tests
  server.listen({ onUnhandledRequest: 'warn' });
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  server.close();
  console.error = originalError;
  console.warn = originalWarn;
});

afterEach(() => {
  server.resetHandlers();
});