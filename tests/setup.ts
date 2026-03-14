// Vitest setup file for global test configuration
// Set test environment variables BEFORE any imports
process.env.TELEGRAM_FEED_DELAY_MS = "0";

import "@testing-library/jest-dom";
import { beforeAll, afterAll, afterEach, vi } from "vitest";

// Polyfill for various web APIs that are not available in the Node.js environment
// but are expected by libraries like 'undici' and 'msw'.
// These must be set on the global object BEFORE the libraries are imported.

const g: any = globalThis as any;

// 1. TextEncoder/TextDecoder
import { TextEncoder, TextDecoder } from "util";
if (typeof g.TextEncoder === "undefined") {
  g.TextEncoder = TextEncoder;
}
if (typeof g.TextDecoder === "undefined") {
  g.TextDecoder = TextDecoder;
}

// 2. Web Streams API
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

// 3. MessagePort/MessageChannel (for undici) and BroadcastChannel (for msw)
// These are available in 'worker_threads' in Node.js
try {
  const { MessagePort, MessageChannel, BroadcastChannel } =
    await import("worker_threads");
  if (typeof g.MessagePort === "undefined" && MessagePort) {
    g.MessagePort = MessagePort;
  }
  if (typeof g.MessageChannel === "undefined" && MessageChannel) {
    g.MessageChannel = MessageChannel;
  }
  if (typeof g.BroadcastChannel === "undefined" && BroadcastChannel) {
    g.BroadcastChannel = BroadcastChannel;
  }
} catch {}

// 4. Request/Response (from undici)
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

// Now that all polyfills are in place, import the MSW server
const { server } = await import("./msw/server");

// Suppress console errors and warnings during tests
// This prevents test error scenarios from cluttering the output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  // Start MSW to intercept external network calls in tests
  server.listen({ onUnhandledRequest: "warn" });
  console.error = vi.fn();
  console.warn = vi.fn();
});

afterAll(() => {
  server.close();
  console.error = originalError;
  console.warn = originalWarn;
});

afterEach(() => {
  server.resetHandlers();
});

// Mock next-intl for test environment
vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string, params?: Record<string, any>) => {
      if (params) {
        return Object.entries(params).reduce(
          (str, [k, v]) => str.replace(`{${k}}`, String(v)),
          key,
        );
      }
      return key;
    };
    t.raw = (key: string) => key;
    return t;
  },
  useLocale: () => "es",
  NextIntlClientProvider: ({ children }: any) => children,
  hasLocale: () => true,
}));

vi.mock("next-intl/middleware", () => ({
  default: vi.fn(() => vi.fn(() => new Response())),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: () => {
    const t = (key: string, params?: Record<string, any>) => {
      if (params) {
        return Object.entries(params).reduce(
          (str, [k, v]) => str.replace(`{${k}}`, String(v)),
          key,
        );
      }
      return key;
    };
    t.raw = (key: string) => key;
    return t;
  },
  setRequestLocale: () => {},
  getMessages: () => ({}),
  getRequestConfig: (fn: any) => fn,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ children, href, ...props }: any) => {
    const React = require("react");
    return React.createElement("a", { href, ...props }, children);
  },
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  redirect: vi.fn(),
  getPathname: vi.fn(),
}));

vi.mock("@/i18n/routing", () => ({
  routing: {
    locales: ["es", "en"],
    defaultLocale: "es",
    pathnames: {},
  },
}));

// Test environment setup complete
// Feature flags are now environment variable-based and don't require special test setup
