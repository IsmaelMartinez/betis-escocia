// Vitest setup file for global test configuration
// Set test environment variables BEFORE any imports
process.env.TELEGRAM_FEED_DELAY_MS = "0";

import "@testing-library/jest-dom";
import { beforeAll, afterAll, vi } from "vitest";

// Polyfills for web APIs that jsdom does not provide but the codebase
// (or its libraries) may touch via the global object.

const g: any = globalThis as any;

import { TextEncoder, TextDecoder } from "util";
if (typeof g.TextEncoder === "undefined") {
  g.TextEncoder = TextEncoder;
}
if (typeof g.TextDecoder === "undefined") {
  g.TextDecoder = TextDecoder;
}

import * as webStreams from "stream/web";
if (typeof g.ReadableStream === "undefined" && webStreams?.ReadableStream) {
  g.ReadableStream = webStreams.ReadableStream;
}
if (typeof g.WritableStream === "undefined" && webStreams?.WritableStream) {
  g.WritableStream = webStreams.WritableStream;
}
if (typeof g.TransformStream === "undefined" && webStreams?.TransformStream) {
  g.TransformStream = webStreams.TransformStream;
}

try {
  const { MessagePort, MessageChannel } = await import("worker_threads");
  if (typeof g.MessagePort === "undefined" && MessagePort) {
    g.MessagePort = MessagePort;
  }
  if (typeof g.MessageChannel === "undefined" && MessageChannel) {
    g.MessageChannel = MessageChannel;
  }
} catch {}

const undici = await import("undici");
if (typeof g.Request === "undefined" && typeof undici.Request === "function") {
  g.Request = undici.Request;
}
if (
  typeof g.Response === "undefined" &&
  typeof undici.Response === "function"
) {
  g.Response = undici.Response;
}
if (typeof g.fetch === "undefined" && typeof undici.fetch === "function") {
  g.fetch = undici.fetch;
}
if (typeof g.Headers === "undefined" && typeof undici.Headers === "function") {
  g.Headers = undici.Headers;
}

// Suppress console errors and warnings during tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});
