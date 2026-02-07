/**
 * Structured logging utility for the Real Betis supporters club application
 * 
 * Provides consistent, structured logging across the application with:
 * - Log levels (debug, info, warn, error)
 * - Structured metadata
 * - Environment-aware output
 * - Context preservation
 * - Performance tracking
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

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
  private globalContext: LogContext = {};

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isTest = process.env.NODE_ENV === 'test' || !!process.env.VITEST;
  }

  /**
   * Set global context that will be included in all log entries
   */
  setGlobalContext(context: LogContext): void {
    this.globalContext = { ...this.globalContext, ...context };
  }

  /**
   * Clear global context
   */
  clearGlobalContext(): void {
    this.globalContext = {};
  }

  /**
   * Create a child logger with additional context
   */
  child(context: LogContext): Logger {
    const childLogger = new Logger();
    childLogger.globalContext = { ...this.globalContext, ...context };
    return childLogger;
  }

  /**
   * Debug level logging - only shown in development
   */
  debug(message: string, context?: LogContext, metadata?: Record<string, unknown>): void {
    if (this.isDevelopment && !this.isTest) {
      this.log('debug', message, context, metadata);
    }
  }

  /**
   * Info level logging
   */
  info(message: string, context?: LogContext, metadata?: Record<string, unknown>): void {
    this.log('info', message, context, metadata);
  }

  /**
   * Warning level logging
   */
  warn(message: string, context?: LogContext, metadata?: Record<string, unknown>): void {
    this.log('warn', message, context, metadata);
  }

  /**
   * Error level logging
   */
  error(message: string, error?: Error | unknown, context?: LogContext, metadata?: Record<string, unknown>): void {
    let errorInfo: LogEntry['error'] | undefined;

    if (error instanceof Error) {
      errorInfo = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        cause: error.cause
      };
    } else if (error && typeof error === 'object') {
      // Handle Supabase/PostgreSQL errors and other object errors
      const errorObj = error as Record<string, unknown>;
      errorInfo = {
        name: (errorObj.code as string) || 'Unknown Error',
        message: (errorObj.message as string) || (errorObj.hint as string) || JSON.stringify(error)
      };
    } else if (error) {
      errorInfo = {
        name: 'Unknown Error',
        message: String(error)
      };
    }

    this.log('error', message, context, metadata, errorInfo);
  }

  /**
   * Log API requests with timing
   */
  apiRequest(method: string, path: string, statusCode: number, duration: number, context?: LogContext): void {
    const level = statusCode >= 400 ? 'error' : statusCode >= 300 ? 'warn' : 'info';
    const message = `${method} ${path} ${statusCode} - ${duration}ms`;
    
    this.log(level, message, {
      ...context,
      method,
      path,
      statusCode,
      duration,
      type: 'api_request'
    });
  }

  /**
   * Log database operations
   */
  database(operation: string, table: string, duration?: number, error?: Error, context?: LogContext): void {
    const message = error 
      ? `Database ${operation} failed on ${table}` 
      : `Database ${operation} on ${table}${duration ? ` - ${duration}ms` : ''}`;
    
    const level = error ? 'error' : 'debug';
    
    this.log(level, message, {
      ...context,
      operation,
      table,
      duration,
      type: 'database'
    }, undefined, error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : undefined);
  }

  /**
   * Log authentication events
   */
  auth(event: string, userId?: string, success: boolean = true, context?: LogContext): void {
    const message = `Auth ${event}: ${success ? 'success' : 'failed'}${userId ? ` for user ${userId}` : ''}`;
    const level = success ? 'info' : 'warn';
    
    this.log(level, message, {
      ...context,
      userId,
      event,
      success,
      type: 'auth'
    });
  }

  /**
   * Log feature flag usage
   */
  featureFlag(flag: string, enabled: boolean, userId?: string, context?: LogContext): void {
    this.debug(`Feature flag ${flag}: ${enabled ? 'enabled' : 'disabled'}`, {
      ...context,
      userId,
      flag,
      enabled,
      type: 'feature_flag'
    });
  }

  /**
   * Log business events
   */
  business(event: string, metadata?: Record<string, unknown>, context?: LogContext): void {
    this.info(`Business event: ${event}`, {
      ...context,
      event,
      type: 'business'
    }, metadata);
  }

  /**
   * Core logging method
   */
  private log(
    level: LogLevel, 
    message: string, 
    context?: LogContext, 
    metadata?: Record<string, unknown>,
    error?: LogEntry['error']
  ): void {
    // Skip logging in test environment unless it's an error
    if (this.isTest && level !== 'error') {
      return;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...(context || this.globalContext ? {
        context: { ...this.globalContext, ...context }
      } : {}),
      ...(error && { error }),
      ...(metadata && { metadata })
    };

    // In development, use console with colors and formatting
    if (this.isDevelopment) {
      this.logToConsole(logEntry);
    } else {
      // In production, output structured JSON for log aggregation
      this.logToJson(logEntry);
    }
  }

  /**
   * Development console output with colors
   */
  private logToConsole(entry: LogEntry): void {
    const colors = {
      debug: '\x1b[36m', // Cyan
      info: '\x1b[32m',  // Green
      warn: '\x1b[33m',  // Yellow
      error: '\x1b[31m'  // Red
    };
    
    const reset = '\x1b[0m';
    const bold = '\x1b[1m';
    const color = colors[entry.level] || '';
    
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
      if (entry.error.stack && entry.level === 'error') {
        output += `\n  Stack: ${entry.error.stack}`;
      }
    }

    // Use appropriate console method
    switch (entry.level) {
      case 'debug':
        console.debug(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
        console.error(output);
        break;
    }
  }

  /**
   * Production JSON output
   */
  private logToJson(entry: LogEntry): void {
    // In production, output clean JSON for log aggregation systems
    console.log(JSON.stringify(entry));
  }
}

// Export singleton logger instance
export const logger = new Logger();

// Export convenience functions for common use cases
export const log = {
  debug: logger.debug.bind(logger),
  info: logger.info.bind(logger),
  warn: logger.warn.bind(logger),
  error: logger.error.bind(logger),
  apiRequest: logger.apiRequest.bind(logger),
  database: logger.database.bind(logger),
  auth: logger.auth.bind(logger),
  featureFlag: logger.featureFlag.bind(logger),
  business: logger.business.bind(logger),
  child: logger.child.bind(logger),
  setGlobalContext: logger.setGlobalContext.bind(logger),
  clearGlobalContext: logger.clearGlobalContext.bind(logger)
};

export default logger;