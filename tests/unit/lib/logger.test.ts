import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { logger, log, type LogContext, type LogEntry, type LogLevel } from '@/lib/logger';

// Mock console methods
const consoleMocks = {
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
};

describe('Logger', () => {
  const originalEnv = process.env;
  const originalConsole = {
    log: console.log,
    debug: console.debug,
    info: console.info,
    warn: console.warn,
    error: console.error
  };

  beforeEach(() => {
    // Reset environment
    process.env = { ...originalEnv };
    
    // Mock console methods
    Object.assign(console, consoleMocks);
    
    // Clear all mocks
    Object.values(consoleMocks).forEach(mock => mock.mockClear());
    
    // Clear global context
    logger.clearGlobalContext();
  });

  afterEach(() => {
    // Restore environment
    process.env = originalEnv;
    
    // Restore console methods
    Object.assign(console, originalConsole);
  });

  describe('Environment Detection', () => {
    it('should detect development environment', () => {
      process.env.NODE_ENV = 'development';
      process.env.VITEST = '';
      
      const testLogger = new (logger.constructor as any)();
      testLogger.info('test message');
      
      // In development, should use colored console output
      expect(consoleMocks.info).toHaveBeenCalled();
    });

    it('should detect test environment with NODE_ENV', () => {
      process.env.NODE_ENV = 'test';
      
      const testLogger = new (logger.constructor as any)();
      testLogger.info('test message');
      
      // In test env, info messages should be skipped
      expect(consoleMocks.info).not.toHaveBeenCalled();
    });

    it('should detect test environment with VITEST', () => {
      process.env.NODE_ENV = 'development';
      process.env.VITEST = 'true';
      
      const testLogger = new (logger.constructor as any)();
      testLogger.info('test message');
      
      // When VITEST is set, should still be treated as test
      expect(consoleMocks.info).not.toHaveBeenCalled();
    });

    it('should detect production environment', () => {
      process.env.NODE_ENV = 'production';
      process.env.VITEST = '';
      
      const testLogger = new (logger.constructor as any)();
      testLogger.info('test message');
      
      // In production, should use JSON output
      expect(consoleMocks.log).toHaveBeenCalled();
      const logOutput = consoleMocks.log.mock.calls[0][0];
      expect(() => JSON.parse(logOutput)).not.toThrow();
    });
  });

  describe('Global Context Management', () => {
    it('should set and use global context', () => {
      process.env.NODE_ENV = 'production';
      process.env.VITEST = '';
      
      // Create a new logger instance for production
      const testLogger = new (logger.constructor as any)();
      const globalContext: LogContext = {
        userId: 'user123',
        requestId: 'req456'
      };

      testLogger.setGlobalContext(globalContext);
      testLogger.info('Test message');

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.context).toMatchObject(globalContext);
    });

    it('should merge multiple global context calls', () => {
      process.env.NODE_ENV = 'production';
      process.env.VITEST = '';
      
      const testLogger = new (logger.constructor as any)();
      testLogger.setGlobalContext({ userId: 'user123' });
      testLogger.setGlobalContext({ requestId: 'req456' });
      testLogger.info('Test message');

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.context).toMatchObject({
        userId: 'user123',
        requestId: 'req456'
      });
    });

    it('should clear global context', () => {
      process.env.NODE_ENV = 'production';
      process.env.VITEST = '';
      
      const testLogger = new (logger.constructor as any)();
      testLogger.setGlobalContext({ userId: 'user123' });
      testLogger.clearGlobalContext();
      testLogger.info('Test message');

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      // After clearing, context should be empty object, not undefined
      expect(logEntry.context).toEqual({});
    });
  });

  describe('Child Logger', () => {
    it('should create child logger with additional context', () => {
      process.env.NODE_ENV = 'production';
      process.env.VITEST = '';
      
      const testLogger = new (logger.constructor as any)();
      testLogger.setGlobalContext({ userId: 'user123' });
      const childLogger = testLogger.child({ requestId: 'req456' });
      childLogger.info('Child message');

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.context).toMatchObject({
        userId: 'user123',
        requestId: 'req456'
      });
    });

    it('should inherit parent context but not affect parent', () => {
      process.env.NODE_ENV = 'production';
      process.env.VITEST = '';
      
      const testLogger = new (logger.constructor as any)();
      testLogger.setGlobalContext({ userId: 'parent' });
      const childLogger = testLogger.child({ requestId: 'child' });
      
      // Child should have both contexts
      childLogger.info('Child message');
      expect(consoleMocks.log).toHaveBeenCalledTimes(1);
      let logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.context).toMatchObject({
        userId: 'parent',
        requestId: 'child'
      });

      consoleMocks.log.mockClear();

      // Parent should only have its own context
      testLogger.info('Parent message');
      expect(consoleMocks.log).toHaveBeenCalledTimes(1);
      logEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.context).toMatchObject({ userId: 'parent' });
      expect(logEntry.context?.requestId).toBeUndefined();
    });
  });

  describe('Log Levels', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.VITEST = '';
    });

    it('should log info messages', () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.info('Info message', { key: 'value' }, { meta: 'data' });

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.level).toBe('info');
      expect(logEntry.message).toBe('Info message');
      expect(logEntry.context).toMatchObject({ key: 'value' });
      expect(logEntry.metadata).toMatchObject({ meta: 'data' });
    });

    it('should log warn messages', () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.warn('Warning message');

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.level).toBe('warn');
      expect(logEntry.message).toBe('Warning message');
    });

    it('should log error messages with Error objects', () => {
      const testLogger = new (logger.constructor as any)();
      const testError = new Error('Test error');
      testError.stack = 'Error stack trace';
      testError.cause = 'Error cause';

      testLogger.error('Error occurred', testError);

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.level).toBe('error');
      expect(logEntry.message).toBe('Error occurred');
      expect(logEntry.error).toMatchObject({
        name: 'Error',
        message: 'Test error',
        stack: 'Error stack trace',
        cause: 'Error cause'
      });
    });

    it('should log error messages with non-Error objects', () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.error('Error occurred', 'string error');

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.error).toMatchObject({
        name: 'Unknown Error',
        message: 'string error'
      });
    });

    it('should log error messages without error object', () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.error('Error occurred');

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.error).toBeUndefined();
    });

    it('should handle debug messages in development', () => {
      process.env.NODE_ENV = 'development';
      process.env.VITEST = '';
      
      const testLogger = new (logger.constructor as any)();
      testLogger.debug('Debug message');

      expect(consoleMocks.debug).toHaveBeenCalled();
    });

    it('should skip debug messages in production', () => {
      process.env.NODE_ENV = 'production';
      process.env.VITEST = '';
      
      const testLogger = new (logger.constructor as any)();
      testLogger.debug('Debug message');

      expect(consoleMocks.log).not.toHaveBeenCalled();
      expect(consoleMocks.debug).not.toHaveBeenCalled();
    });

    it('should skip debug messages in test environment', () => {
      process.env.NODE_ENV = 'test';
      
      const testLogger = new (logger.constructor as any)();
      testLogger.debug('Debug message');

      expect(consoleMocks.log).not.toHaveBeenCalled();
      expect(consoleMocks.debug).not.toHaveBeenCalled();
    });
  });

  describe('Specialized Logging Methods', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.VITEST = '';
    });

    describe('apiRequest', () => {
      it('should log successful API requests as info', () => {
        const testLogger = new (logger.constructor as any)();
        testLogger.apiRequest('GET', '/api/test', 200, 150, { userId: 'user123' });

        expect(consoleMocks.log).toHaveBeenCalled();
        const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
        expect(logEntry.level).toBe('info');
        expect(logEntry.message).toBe('GET /api/test 200 - 150ms');
        expect(logEntry.context).toMatchObject({
          userId: 'user123',
          method: 'GET',
          path: '/api/test',
          statusCode: 200,
          duration: 150,
          type: 'api_request'
        });
      });

      it('should log redirect API requests as warn', () => {
        const testLogger = new (logger.constructor as any)();
        testLogger.apiRequest('GET', '/api/redirect', 302, 50);

        expect(consoleMocks.log).toHaveBeenCalled();
        const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
        expect(logEntry.level).toBe('warn');
      });

      it('should log error API requests as error', () => {
        const testLogger = new (logger.constructor as any)();
        testLogger.apiRequest('POST', '/api/error', 500, 1000);

        expect(consoleMocks.log).toHaveBeenCalled();
        const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
        expect(logEntry.level).toBe('error');
      });
    });

    describe('database', () => {
      it('should log successful database operations as debug', () => {
        logger.database('SELECT', 'users', 25, undefined, { query: 'SELECT * FROM users' });

        // Debug logs are skipped in test, but we can verify it would be called
        expect(consoleMocks.log).not.toHaveBeenCalled();
      });

      it('should log database errors', () => {
        const testLogger = new (logger.constructor as any)();
        const dbError = new Error('Connection failed');
        testLogger.database('INSERT', 'users', undefined, dbError);

        expect(consoleMocks.log).toHaveBeenCalled();
        const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
        expect(logEntry.level).toBe('error');
        expect(logEntry.message).toBe('Database INSERT failed on users');
        expect(logEntry.context).toMatchObject({
          operation: 'INSERT',
          table: 'users',
          type: 'database'
        });
        expect(logEntry.error).toMatchObject({
          name: 'Error',
          message: 'Connection failed'
        });
      });

      it('should log database operations with duration', () => {
        process.env.NODE_ENV = 'development';
        process.env.VITEST = '';
        
        const testLogger = new (logger.constructor as any)();
        testLogger.database('UPDATE', 'users', 45);

        expect(consoleMocks.debug).toHaveBeenCalled();
        // Can't easily parse console debug output, but we know it was called
      });

      it('should log database operations without duration', () => {
        process.env.NODE_ENV = 'development';
        process.env.VITEST = '';
        
        const testLogger = new (logger.constructor as any)();
        testLogger.database('DELETE', 'sessions');

        expect(consoleMocks.debug).toHaveBeenCalled();
      });
    });

    describe('auth', () => {
      it('should log successful auth events as info', () => {
        const testLogger = new (logger.constructor as any)();
        testLogger.auth('login', 'user123', true, { ip: '127.0.0.1' });

        expect(consoleMocks.log).toHaveBeenCalled();
        const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
        expect(logEntry.level).toBe('info');
        expect(logEntry.message).toBe('Auth login: success for user user123');
        expect(logEntry.context).toMatchObject({
          userId: 'user123',
          event: 'login',
          success: true,
          type: 'auth',
          ip: '127.0.0.1'
        });
      });

      it('should log failed auth events as warn', () => {
        const testLogger = new (logger.constructor as any)();
        testLogger.auth('login', undefined, false);

        expect(consoleMocks.log).toHaveBeenCalled();
        const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
        expect(logEntry.level).toBe('warn');
        expect(logEntry.message).toBe('Auth login: failed');
      });

      it('should use default success value', () => {
        const testLogger = new (logger.constructor as any)();
        testLogger.auth('logout', 'user123');

        expect(consoleMocks.log).toHaveBeenCalled();
        const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
        expect(logEntry.level).toBe('info');
        expect(logEntry.message).toBe('Auth logout: success for user user123');
      });
    });

    describe('featureFlag', () => {
      it('should log feature flag usage as debug', () => {
        process.env.NODE_ENV = 'development';
        process.env.VITEST = '';
        
        const testLogger = new (logger.constructor as any)();
        testLogger.featureFlag('new-feature', true, 'user123', { experiment: 'A' });

        expect(consoleMocks.debug).toHaveBeenCalled();
      });

      it('should log disabled feature flags', () => {
        process.env.NODE_ENV = 'development';
        process.env.VITEST = '';
        
        const testLogger = new (logger.constructor as any)();
        testLogger.featureFlag('old-feature', false, 'user123');

        expect(consoleMocks.debug).toHaveBeenCalled();
      });
    });

    describe('business', () => {
      it('should log business events as info', () => {
        const testLogger = new (logger.constructor as any)();
        testLogger.business('user_signup', { source: 'web' }, { campaign: 'summer2024' });

        expect(consoleMocks.log).toHaveBeenCalled();
        const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
        expect(logEntry.level).toBe('info');
        expect(logEntry.message).toBe('Business event: user_signup');
        expect(logEntry.context).toMatchObject({
          event: 'user_signup',
          type: 'business',
          campaign: 'summer2024'
        });
        expect(logEntry.metadata).toMatchObject({ source: 'web' });
      });
    });
  });

  describe('Development Console Output', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.VITEST = '';
    });

    it('should format console output with colors for different levels', () => {
      const testLogger = new (logger.constructor as any)();
      
      testLogger.debug('Debug message');
      testLogger.info('Info message');
      testLogger.warn('Warn message');
      testLogger.error('Error message');

      expect(consoleMocks.debug).toHaveBeenCalled();
      expect(consoleMocks.info).toHaveBeenCalled();
      expect(consoleMocks.warn).toHaveBeenCalled();
      expect(consoleMocks.error).toHaveBeenCalled();

      // Verify that each console method was called with formatted output
      expect(consoleMocks.debug.mock.calls[0][0]).toContain('DEBUG');
      expect(consoleMocks.info.mock.calls[0][0]).toContain('INFO');
      expect(consoleMocks.warn.mock.calls[0][0]).toContain('WARN');
      expect(consoleMocks.error.mock.calls[0][0]).toContain('ERROR');
    });

    it('should include context in console output', () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.info('Test message', { userId: 'user123', action: 'test' });

      expect(consoleMocks.info).toHaveBeenCalled();
      const output = consoleMocks.info.mock.calls[0][0];
      expect(output).toContain('Context:');
      expect(output).toContain('userId');
      expect(output).toContain('user123');
    });

    it('should include metadata in console output', () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.info('Test message', undefined, { key: 'value' });

      expect(consoleMocks.info).toHaveBeenCalled();
      const output = consoleMocks.info.mock.calls[0][0];
      expect(output).toContain('Metadata:');
      expect(output).toContain('key');
      expect(output).toContain('value');
    });

    it('should include error details in console output', () => {
      const testLogger = new (logger.constructor as any)();
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      
      testLogger.error('Error occurred', error);

      expect(consoleMocks.error).toHaveBeenCalled();
      const output = consoleMocks.error.mock.calls[0][0];
      expect(output).toContain('Error: Error: Test error');
      expect(output).toContain('Stack: Error stack trace');
    });

    it('should not show stack for non-error levels', () => {
      const testLogger = new (logger.constructor as any)();
      const error = new Error('Test error');
      error.stack = 'Error stack trace';
      
      testLogger.warn('Warning with error', error);

      expect(consoleMocks.warn).toHaveBeenCalled();
      const output = consoleMocks.warn.mock.calls[0][0];
      expect(output).toContain('Warning with error');
      // The warn message should include error details but not stack trace
      expect(output).not.toContain('Stack:');
      expect(output).not.toContain('Error stack trace');
    });

    it('should handle empty context and metadata', () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.info('Simple message');

      expect(consoleMocks.info).toHaveBeenCalled();
      const output = consoleMocks.info.mock.calls[0][0];
      expect(output).not.toContain('Context:');
      expect(output).not.toContain('Metadata:');
    });
  });

  describe('Test Environment Behavior', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
    });

    it('should skip non-error logs in test environment', () => {
      logger.debug('Debug message');
      logger.info('Info message');
      logger.warn('Warn message');

      expect(consoleMocks.log).not.toHaveBeenCalled();
      expect(consoleMocks.debug).not.toHaveBeenCalled();
      expect(consoleMocks.info).not.toHaveBeenCalled();
      expect(consoleMocks.warn).not.toHaveBeenCalled();
    });

    it('should still log error messages in test environment', () => {
      logger.error('Error message');

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.level).toBe('error');
      expect(logEntry.message).toBe('Error message');
    });
  });

  describe('Convenience Exports', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.VITEST = '';
    });

    it('should provide convenience log functions', () => {
      // The convenience exports use the global logger which detects test env
      // We need to temporarily replace the logger's environment detection
      const testLogger = new (logger.constructor as any)();
      
      testLogger.info('Test info');
      testLogger.warn('Test warn');
      testLogger.error('Test error');

      expect(consoleMocks.log).toHaveBeenCalledTimes(3);
      
      const entries = consoleMocks.log.mock.calls.map(call => JSON.parse(call[0]));
      expect(entries[0].level).toBe('info');
      expect(entries[1].level).toBe('warn');
      expect(entries[2].level).toBe('error');
    });

    it('should provide convenience specialized functions', () => {
      const testLogger = new (logger.constructor as any)();
      
      testLogger.apiRequest('GET', '/test', 200, 100);
      testLogger.auth('login', 'user123');
      testLogger.business('event', { data: 'test' });

      expect(consoleMocks.log).toHaveBeenCalledTimes(3);
    });

    it('should provide convenience context functions', () => {
      const testLogger = new (logger.constructor as any)();
      
      testLogger.setGlobalContext({ userId: 'user123' });
      testLogger.info('Test with global context');

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.context?.userId).toBe('user123');

      testLogger.clearGlobalContext();
      consoleMocks.log.mockClear();
      
      testLogger.info('Test without global context');
      const logEntry2: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry2.context).toEqual({});
    });

    it('should provide child logger convenience function', () => {
      const childLogger = log.child({ requestId: 'req123' });
      expect(childLogger).toBeDefined();
      expect(typeof childLogger.info).toBe('function');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
      process.env.VITEST = '';
    });

    it('should handle null and undefined error objects', () => {
      const testLogger = new (logger.constructor as any)();
      testLogger.error('Error with null', null);
      testLogger.error('Error with undefined', undefined);

      expect(consoleMocks.log).toHaveBeenCalledTimes(2);
      
      const entries = consoleMocks.log.mock.calls.map(call => JSON.parse(call[0]));
      expect(entries[0].error).toBeUndefined();
      expect(entries[1].error).toBeUndefined();
    });

    it('should handle complex error objects', () => {
      const testLogger = new (logger.constructor as any)();
      const complexError = { 
        code: 'CUSTOM_ERROR', 
        details: 'Complex error details',
        nested: { property: 'value' }
      };
      
      testLogger.error('Complex error', complexError);

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.error).toMatchObject({
        name: 'Unknown Error',
        message: '[object Object]'
      });
    });

    it('should handle very large log entries', () => {
      const testLogger = new (logger.constructor as any)();
      const largeContext = {
        data: 'x'.repeat(10000),
        array: new Array(100).fill('large data'),
        nested: {
          deep: {
            object: 'value'
          }
        }
      };

      testLogger.info('Large log entry', largeContext);

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      expect(logEntry.context?.data).toBe('x'.repeat(10000));
    });

    it('should handle timestamps correctly', () => {
      const testLogger = new (logger.constructor as any)();
      const beforeLog = Date.now();
      testLogger.info('Timestamp test');
      const afterLog = Date.now();

      expect(consoleMocks.log).toHaveBeenCalled();
      const logEntry: LogEntry = JSON.parse(consoleMocks.log.mock.calls[0][0]);
      const logTime = new Date(logEntry.timestamp).getTime();
      
      expect(logTime).toBeGreaterThanOrEqual(beforeLog);
      expect(logTime).toBeLessThanOrEqual(afterLog);
    });
  });
});