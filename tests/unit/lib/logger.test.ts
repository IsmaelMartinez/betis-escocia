import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { logger, type LogEntry } from "@/lib/utils/logger";

// Mock console methods
const consoleMocks = {
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

describe("Logger", () => {
  const originalEnv = process.env;
  const originalConsole = {
    log: console.log,
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error,
  };

  beforeEach(() => {
    process.env = { ...originalEnv };
    Object.assign(console, consoleMocks);
    Object.values(consoleMocks).forEach((mock) => mock.mockClear());
  });

  afterEach(() => {
    process.env = originalEnv;
    Object.assign(console, originalConsole);
  });

  describe("Environment Detection", () => {
    it("should detect development environment", () => {
      vi.stubEnv("NODE_ENV", "development");
      process.env.VITEST = "";

      const testLogger = new (logger.constructor as any)();
      testLogger.info("Test message");

      expect(consoleMocks.info).toHaveBeenCalled();
    });

    it("should detect test environment with NODE_ENV", () => {
      vi.stubEnv("NODE_ENV", "test");
      delete process.env.VITEST;

      const testLogger = new (logger.constructor as any)();
      testLogger.info("Test message");

      // In test environment, non-error logs should be skipped
      expect(consoleMocks.log).not.toHaveBeenCalled();
    });

    it("should detect test environment with VITEST", () => {
      vi.stubEnv("NODE_ENV", "production");
      process.env.VITEST = "true";

      const testLogger = new (logger.constructor as any)();
      testLogger.info("Test message");

      expect(consoleMocks.log).not.toHaveBeenCalled();
    });

    it("should detect production environment", () => {
      vi.stubEnv("NODE_ENV", "production");
      process.env.VITEST = "";

      const testLogger = new (logger.constructor as any)();
      testLogger.info("Test message");

      expect(consoleMocks.log).toHaveBeenCalled();
    });
  });

  describe("Log Levels", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "production");
      process.env.VITEST = "";
    });

    it("should log info messages", () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.info("Info message", { key: "value" }, { meta: "data" });

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.level).toBe("info");
      expect(logEntry.message).toBe("Info message");
      expect(logEntry.context).toMatchObject({ key: "value" });
      expect(logEntry.metadata).toMatchObject({ meta: "data" });
    });

    it("should log warn messages", () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.warn("Warning message");

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.level).toBe("warn");
      expect(logEntry.message).toBe("Warning message");
    });

    it("should log error messages with Error objects", () => {
      const testLogger = new (logger.constructor as any)();
      const testError = new Error("Test error");
      testError.stack = "Error stack trace";
      testError.cause = "Error cause";

      testLogger.error("Error occurred", testError);

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.level).toBe("error");
      expect(logEntry.message).toBe("Error occurred");
      expect(logEntry.error).toMatchObject({
        name: "Error",
        message: "Test error",
        stack: "Error stack trace",
        cause: "Error cause",
      });
    });

    it("should log error messages with non-Error objects", () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.error("Error occurred", "string error");

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.error).toMatchObject({
        name: "Unknown Error",
        message: "string error",
      });
    });

    it("should log error messages without error object", () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.error("Error occurred");

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.error).toBeUndefined();
    });

    it("should handle debug messages in development", () => {
      vi.stubEnv("NODE_ENV", "development");
      process.env.VITEST = "";

      const testLogger = new (logger.constructor as any)();
      testLogger.debug("Debug message");

      expect(consoleMocks.debug).toHaveBeenCalled();
    });

    it("should skip debug messages in production", () => {
      vi.stubEnv("NODE_ENV", "production");
      process.env.VITEST = "";

      const testLogger = new (logger.constructor as any)();
      testLogger.debug("Debug message");

      expect(consoleMocks.log).not.toHaveBeenCalled();
      expect(consoleMocks.debug).not.toHaveBeenCalled();
    });

    it("should skip debug messages in test environment", () => {
      vi.stubEnv("NODE_ENV", "test");

      const testLogger = new (logger.constructor as any)();
      testLogger.debug("Debug message");

      expect(consoleMocks.log).not.toHaveBeenCalled();
      expect(consoleMocks.debug).not.toHaveBeenCalled();
    });
  });

  describe("Development Console Output", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "development");
      process.env.VITEST = "";
    });

    it("should format console output with colors for different levels", () => {
      const testLogger = new (logger.constructor as any)();

      testLogger.debug("Debug message");
      testLogger.info("Info message");
      testLogger.warn("Warn message");
      testLogger.error("Error message");

      expect(consoleMocks.debug).toHaveBeenCalled();
      expect(consoleMocks.info).toHaveBeenCalled();
      expect(consoleMocks.warn).toHaveBeenCalled();
      expect(consoleMocks.error).toHaveBeenCalled();

      expect(consoleMocks.debug.mock.calls[0][0]).toContain("DEBUG");
      expect(consoleMocks.info.mock.calls[0][0]).toContain("INFO");
      expect(consoleMocks.warn.mock.calls[0][0]).toContain("WARN");
      expect(consoleMocks.error.mock.calls[0][0]).toContain("ERROR");
    });

    it("should include context in console output", () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.info("Test message", { userId: "user123", action: "test" });

      expect(consoleMocks.info).toHaveBeenCalled();
      const output = consoleMocks.info.mock.calls[0][0];
      expect(output).toContain("Context:");
      expect(output).toContain("userId");
      expect(output).toContain("user123");
    });

    it("should include metadata in console output", () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.info("Test message", undefined, { key: "value" });

      expect(consoleMocks.info).toHaveBeenCalled();
      const output = consoleMocks.info.mock.calls[0][0];
      expect(output).toContain("Metadata:");
      expect(output).toContain("key");
      expect(output).toContain("value");
    });

    it("should include error details in console output", () => {
      const testLogger = new (logger.constructor as any)();
      const error = new Error("Test error");
      error.stack = "Error stack trace";

      testLogger.error("Error occurred", error);

      expect(consoleMocks.error).toHaveBeenCalled();
      const output = consoleMocks.error.mock.calls[0][0];
      expect(output).toContain("Error: Error: Test error");
      expect(output).toContain("Stack: Error stack trace");
    });

    it("should not show stack for non-error levels", () => {
      const testLogger = new (logger.constructor as any)();
      const error = new Error("Test error");
      error.stack = "Error stack trace";

      testLogger.warn("Warning with error", error);

      expect(consoleMocks.warn).toHaveBeenCalled();
      const output = consoleMocks.warn.mock.calls[0][0];
      expect(output).toContain("Warning with error");
      expect(output).not.toContain("Stack:");
      expect(output).not.toContain("Error stack trace");
    });

    it("should handle empty context and metadata", () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.info("Simple message");

      expect(consoleMocks.info).toHaveBeenCalled();
      const output = consoleMocks.info.mock.calls[0][0];
      expect(output).not.toContain("Context:");
      expect(output).not.toContain("Metadata:");
    });
  });

  describe("Test Environment Behavior", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "test");
    });

    it("should skip non-error logs in test environment", () => {
      logger.debug("Debug message");
      logger.info("Info message");
      logger.warn("Warn message");

      expect(consoleMocks.log).not.toHaveBeenCalled();
      expect(consoleMocks.debug).not.toHaveBeenCalled();
      expect(consoleMocks.info).not.toHaveBeenCalled();
      expect(consoleMocks.warn).not.toHaveBeenCalled();
    });

    it("should still log error messages in test environment", () => {
      logger.error("Error message");

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.level).toBe("error");
      expect(logEntry.message).toBe("Error message");
    });
  });

  describe("Convenience Exports", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "production");
      process.env.VITEST = "";
    });

    it("should provide convenience log functions", () => {
      const testLogger = new (logger.constructor as any)();

      testLogger.info("Test info");
      testLogger.warn("Test warn");
      testLogger.error("Test error");

      expect(consoleMocks.log).toHaveBeenCalledTimes(3);

      const entries = consoleMocks.log.mock.calls.map((call) =>
        JSON.parse(call[0]),
      );
      expect(entries[0].level).toBe("info");
      expect(entries[1].level).toBe("warn");
      expect(entries[2].level).toBe("error");
    });
  });

  describe("Edge Cases and Error Handling", () => {
    beforeEach(() => {
      vi.stubEnv("NODE_ENV", "production");
      process.env.VITEST = "";
    });

    it("should handle null and undefined error objects", () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.error("Error with null", null);
      testLogger.error("Error with undefined", undefined);

      expect(consoleMocks.log).toHaveBeenCalledTimes(2);

      const entries = consoleMocks.log.mock.calls.map((call) =>
        JSON.parse(call[0]),
      );
      expect(entries[0].error).toBeUndefined();
      expect(entries[1].error).toBeUndefined();
    });

    it("should handle complex error objects", () => {
      const testLogger = new (logger.constructor as any)();
      const complexError = {
        code: "CUSTOM_ERROR",
        details: "Complex error details",
        nested: { property: "value" },
      };

      testLogger.error("Complex error", complexError);

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.error).toMatchObject({
        name: "CUSTOM_ERROR",
        message: JSON.stringify(complexError),
      });
    });

    it("should handle very large log entries", () => {
      const testLogger = new (logger.constructor as any)();
      const largeContext = {
        data: "x".repeat(10000),
        array: new Array(100).fill("large data"),
        nested: {
          deep: {
            object: "value",
          },
        },
      };

      testLogger.info("Large log entry", largeContext);

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.context?.data).toBe("x".repeat(10000));
    });

    it("should handle timestamps correctly", () => {
      const testLogger = new (logger.constructor as any)();
      const beforeLog = Date.now();
      testLogger.info("Timestamp test");
      const afterLog = Date.now();

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      const logTime = new Date(logEntry.timestamp).getTime();

      expect(logTime).toBeGreaterThanOrEqual(beforeLog);
      expect(logTime).toBeLessThanOrEqual(afterLog);
    });
  });
});
