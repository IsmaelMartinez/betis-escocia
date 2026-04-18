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

// Mock next-intl so components that call useTranslations/useLocale render
// without requiring a real NextIntlClientProvider in every test.
// Resolves keys against messages/es.json to preserve test assertions against
// real UI strings.
import esMessages from "../messages/es.json" with { type: "json" };

const resolveKey = (
  namespace: string | undefined,
  key: string,
  values?: Record<string, unknown>,
) => {
  const fullPath = namespace ? `${namespace}.${key}` : key;
  let node: unknown = esMessages;
  for (const segment of fullPath.split(".")) {
    if (node && typeof node === "object" && segment in (node as object)) {
      node = (node as Record<string, unknown>)[segment];
    } else {
      return fullPath;
    }
  }
  let result = typeof node === "string" ? node : fullPath;
  if (values) {
    result = Object.entries(values).reduce(
      (out, [name, value]) => out.replace(`{${name}}`, String(value)),
      result,
    );
  }
  return result;
};

// Cache `t` functions per namespace so the reference is stable across renders
// and doesn't break useEffect dependency arrays.
const translatorCache = new Map<string, ReturnType<typeof makeTranslator>>();
function makeTranslator(namespace: string | undefined) {
  const t = (key: string, values?: Record<string, unknown>) =>
    resolveKey(namespace, key, values);
  t.rich = (key: string) => resolveKey(namespace, key);
  t.raw = (key: string) => resolveKey(namespace, key);
  t.has = () => true;
  t.markup = (key: string) => resolveKey(namespace, key);
  return t;
}
function getTranslator(namespace?: string) {
  const cacheKey = namespace ?? "";
  let cached = translatorCache.get(cacheKey);
  if (!cached) {
    cached = makeTranslator(namespace);
    translatorCache.set(cacheKey, cached);
  }
  return cached;
}

vi.mock("next-intl", () => ({
  useTranslations: (namespace?: string) => getTranslator(namespace),
  useLocale: () => "es",
  useMessages: () => esMessages,
  useFormatter: () => ({
    dateTime: (value: Date | number) => new Date(value).toISOString(),
    number: (value: number) => String(value),
    relativeTime: () => "",
    list: (items: string[]) => items.join(", "),
  }),
  useNow: () => new Date(),
  useTimeZone: () => "UTC",
  hasLocale: (locales: readonly string[], value: unknown) =>
    typeof value === "string" && locales.includes(value),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) =>
    children,
}));

vi.mock("next-intl/middleware", () => ({
  default: () => () => ({ headers: new Headers() }),
}));

vi.mock("next-intl/server", () => ({
  getTranslations: async (arg?: string | { namespace?: string }) => {
    const namespace =
      typeof arg === "string" ? arg : (arg?.namespace ?? undefined);
    return getTranslator(namespace);
  },
  getLocale: async () => "es",
  getMessages: async () => esMessages,
  getFormatter: async () => ({
    dateTime: (value: Date | number) => new Date(value).toISOString(),
    number: (value: number) => String(value),
    relativeTime: () => "",
    list: (items: string[]) => items.join(", "),
  }),
  setRequestLocale: () => {},
  getRequestConfig: (fn: unknown) => fn,
}));

vi.mock("@/i18n/navigation", async () => {
  const React = await import("react");
  return {
    Link: ({
      href,
      children,
      ...rest
    }: {
      href: string;
      children: React.ReactNode;
    } & React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
      React.createElement("a", { href, ...rest }, children),
    redirect: () => {},
    usePathname: () => "/",
    useRouter: () => ({
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
    }),
    getPathname: ({ href }: { href: string }) => href,
  };
});

// Test environment setup complete
// Feature flags are now environment variable-based and don't require special test setup
