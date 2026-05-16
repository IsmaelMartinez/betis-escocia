/**
 * Structured logging utility for the Real Betis supporters club application
 *
 * Provides consistent, structured logging across the application with:
 * - Log levels (debug, info, warn, error)
 * - Structured metadata
 * - Environment-aware output
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  userId?: string;
  requestId?: string;
  userAgent?: string;
  ip?: string;
  path?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  [key: string]: unknown;
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
    cause?: unknown;
  };
  metadata?: Record<string, unknown>;
}

class Logger {
  private isDevelopment: boolean;
  private isTest: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.isTest = process.env.NODE_ENV === "test" || !!process.env.VITEST;
  }

  /**
   * Debug level logging - only shown in development
   */
  debug(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ): void {
    if (this.isDevelopment && !this.isTest) {
      this.log("debug", message, context, metadata);
    }
  }

  /**
   * Info level logging
   */
  info(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ): void {
    this.log("info", message, context, metadata);
  }

  /**
   * Warning level logging
   */
  warn(
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ): void {
    this.log("warn", message, context, metadata);
  }

  /**
   * Error level logging
   */
  error(
    message: string,
    error?: Error | unknown,
    context?: LogContext,
    metadata?: Record<string, unknown>,
  ): void {
    let errorInfo: LogEntry["error"] | undefined;

    if (error instanceof Error) {
      errorInfo = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause,
      };
    } else if (error && typeof error === "object") {
      const errorObj = error as Record<string, unknown>;
      errorInfo = {
        name: (errorObj.code as string) || "Unknown Error",
        message:
          (errorObj.message as string) ||
          (errorObj.hint as string) ||
          JSON.stringify(error),
      };
    } else if (error) {
      errorInfo = {
        name: "Unknown Error",
        message: String(error),
      };
    }

    this.log("error", message, context, metadata, errorInfo);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>,
    error?: LogEntry["error"],
  ): void {
    // Skip logging in test environment unless it's an error
    if (this.isTest && level !== "error") {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context ? { context } : {}),
      ...(error && { error }),
      ...(metadata && { metadata }),
    };

    if (this.isDevelopment) {
      this.logToConsole(logEntry);
    } else {
      this.logToJson(logEntry);
    }
  }

  private logToConsole(entry: LogEntry): void {
    const colors = {
      debug: "\x1b[36m",
      info: "\x1b[32m",
      warn: "\x1b[33m",
      error: "\x1b[31m",
    };

    const reset = "\x1b[0m";
    const bold = "\x1b[1m";
    const color = colors[entry.level] || "";

    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const level = entry.level.toUpperCase().padEnd(5);

    let output = `${color}${bold}[${timestamp}] ${level}${reset} ${entry.message}`;

    if (entry.context && Object.keys(entry.context).length > 0) {
      output += `\n  Context: ${JSON.stringify(entry.context, null, 2)}`;
    }

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      output += `\n  Metadata: ${JSON.stringify(entry.metadata, null, 2)}`;
    }

    if (entry.error) {
      output += `\n  Error: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack && entry.level === "error") {
        output += `\n  Stack: ${entry.error.stack}`;
      }
    }

    switch (entry.level) {
      case "debug":
        console.debug(output);
        break;
      case "info":
        console.info(output);
        break;
      case "warn":
        console.warn(output);
        break;
      case "error":
        console.error(output);
        break;
    }
  }

  private logToJson(entry: LogEntry): void {
    console.log(JSON.stringify(entry));
  }
}

export const logger = new Logger();

export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
};

export default logger;
