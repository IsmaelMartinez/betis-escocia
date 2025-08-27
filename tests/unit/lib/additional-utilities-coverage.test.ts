import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Additional Utilities Coverage Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('URL and Path Utilities', () => {
    it('should validate URLs correctly', () => {
      const isValidUrl = (url: string): boolean => {
        try {
          new URL(url);
          return true;
        } catch {
          return false;
        }
      };

      expect(isValidUrl('https://example.com')).toBe(true);
      expect(isValidUrl('http://localhost:3000')).toBe(true);
      expect(isValidUrl('invalid-url')).toBe(false);
      expect(isValidUrl('')).toBe(false);
      expect(isValidUrl('ftp://files.example.com')).toBe(true);
    });

    it('should extract domain from URLs', () => {
      const extractDomain = (url: string): string | null => {
        try {
          return new URL(url).hostname;
        } catch {
          return null;
        }
      };

      expect(extractDomain('https://example.com/path')).toBe('example.com');
      expect(extractDomain('http://subdomain.example.com')).toBe('subdomain.example.com');
      expect(extractDomain('invalid')).toBe(null);
    });

    it('should build query strings from objects', () => {
      const buildQueryString = (params: Record<string, any>): string => {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            searchParams.append(key, String(value));
          }
        });
        return searchParams.toString();
      };

      expect(buildQueryString({ page: 1, limit: 10 })).toBe('page=1&limit=10');
      expect(buildQueryString({ search: 'hello world' })).toBe('search=hello+world');
      expect(buildQueryString({ active: true, disabled: false })).toBe('active=true&disabled=false');
      expect(buildQueryString({ test: null, valid: 'yes' })).toBe('valid=yes');
    });

    it('should parse query strings to objects', () => {
      const parseQueryString = (queryString: string): Record<string, string> => {
        const params = new URLSearchParams(queryString);
        const result: Record<string, string> = {};
        params.forEach((value, key) => {
          result[key] = value;
        });
        return result;
      };

      expect(parseQueryString('page=1&limit=10')).toEqual({ page: '1', limit: '10' });
      expect(parseQueryString('search=hello%20world')).toEqual({ search: 'hello world' });
      expect(parseQueryString('')).toEqual({});
    });
  });

  describe('Form Validation Utilities', () => {
    it('should validate email formats', () => {
      const isValidEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user+tag@domain.co.uk')).toBe(true);
      expect(isValidEmail('invalid-email')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });

    it('should validate phone numbers', () => {
      const isValidPhone = (phone: string): boolean => {
        // Simple UK phone number validation
        const phoneRegex = /^(\+44|0)[0-9]{10}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
      };

      expect(isValidPhone('07123456789')).toBe(true);
      expect(isValidPhone('+447123456789')).toBe(true);
      expect(isValidPhone('0712 345 6789')).toBe(true);
      expect(isValidPhone('123456')).toBe(false);
      expect(isValidPhone('')).toBe(false);
    });

    it('should validate password strength', () => {
      const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
        const errors: string[] = [];
        
        if (password.length < 8) errors.push('Password must be at least 8 characters');
        if (!/[A-Z]/.test(password)) errors.push('Password must contain uppercase letter');
        if (!/[a-z]/.test(password)) errors.push('Password must contain lowercase letter');
        if (!/\d/.test(password)) errors.push('Password must contain number');
        if (!/[!@#$%^&*]/.test(password)) errors.push('Password must contain special character');

        return { isValid: errors.length === 0, errors };
      };

      expect(validatePassword('Password1!')).toEqual({ isValid: true, errors: [] });
      expect(validatePassword('weak')).toEqual({ 
        isValid: false, 
        errors: expect.arrayContaining([
          'Password must be at least 8 characters',
          'Password must contain uppercase letter',
          'Password must contain number',
          'Password must contain special character'
        ])
      });
    });
  });

  describe('File and Upload Utilities', () => {
    it('should validate file types', () => {
      const isValidFileType = (fileName: string, allowedTypes: string[]): boolean => {
        const extension = fileName.toLowerCase().split('.').pop() || '';
        return allowedTypes.includes(extension);
      };

      expect(isValidFileType('document.pdf', ['pdf', 'doc', 'docx'])).toBe(true);
      expect(isValidFileType('image.JPG', ['jpg', 'png', 'gif'])).toBe(true);
      expect(isValidFileType('script.exe', ['jpg', 'png', 'gif'])).toBe(false);
      expect(isValidFileType('noextension', ['txt'])).toBe(false);
    });

    it('should format file sizes', () => {
      const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(1024));
        
        return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
      };

      expect(formatFileSize(0)).toBe('0 B');
      expect(formatFileSize(512)).toBe('512.0 B');
      expect(formatFileSize(1024)).toBe('1.0 KB');
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1048576)).toBe('1.0 MB');
      expect(formatFileSize(1073741824)).toBe('1.0 GB');
    });

    it('should generate safe filenames', () => {
      const sanitizeFilename = (filename: string): string => {
        return filename
          .replace(/[^a-z0-9.\-_]/gi, '_')
          .replace(/_{2,}/g, '_')
          .replace(/^_+|_+$/g, '');
      };

      expect(sanitizeFilename('My Document.pdf')).toBe('My_Document.pdf');
      expect(sanitizeFilename('file@#$%name.txt')).toBe('file_name.txt');
      expect(sanitizeFilename('___multiple___underscores___.doc')).toBe('multiple_underscores_.doc');
      expect(sanitizeFilename('file with spaces.jpg')).toBe('file_with_spaces.jpg');
    });
  });

  describe('Color and Theme Utilities', () => {
    it('should convert hex to RGB', () => {
      const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
        const match = hex.match(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i);
        return match ? {
          r: parseInt(match[1], 16),
          g: parseInt(match[2], 16),
          b: parseInt(match[3], 16)
        } : null;
      };

      expect(hexToRgb('#FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('#00FF00')).toEqual({ r: 0, g: 255, b: 0 });
      expect(hexToRgb('#0000FF')).toEqual({ r: 0, g: 0, b: 255 });
      expect(hexToRgb('FF0000')).toEqual({ r: 255, g: 0, b: 0 });
      expect(hexToRgb('invalid')).toBe(null);
    });

    it('should calculate color brightness', () => {
      const getBrightness = (r: number, g: number, b: number): number => {
        // Using luminance formula
        return (r * 299 + g * 587 + b * 114) / 1000;
      };

      expect(getBrightness(255, 255, 255)).toBe(255); // White
      expect(getBrightness(0, 0, 0)).toBe(0); // Black
      expect(getBrightness(255, 0, 0)).toBeCloseTo(76.245, 1); // Red
    });

    it('should determine if color is light or dark', () => {
      const isLightColor = (r: number, g: number, b: number): boolean => {
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 128;
      };

      expect(isLightColor(255, 255, 255)).toBe(true); // White
      expect(isLightColor(0, 0, 0)).toBe(false); // Black
      expect(isLightColor(200, 200, 200)).toBe(true); // Light gray
      expect(isLightColor(50, 50, 50)).toBe(false); // Dark gray
    });
  });

  describe('Cache and Storage Utilities', () => {
    it('should handle localStorage with fallbacks', () => {
      const storageUtil = {
        get: (key: string): string | null => {
          try {
            return localStorage.getItem(key);
          } catch {
            return null;
          }
        },
        set: (key: string, value: string): boolean => {
          try {
            localStorage.setItem(key, value);
            return true;
          } catch {
            return false;
          }
        },
        remove: (key: string): boolean => {
          try {
            localStorage.removeItem(key);
            return true;
          } catch {
            return false;
          }
        }
      };

      // These tests will work in jsdom environment
      expect(storageUtil.set('test', 'value')).toBe(true);
      expect(storageUtil.get('test')).toBe('value');
      expect(storageUtil.remove('test')).toBe(true);
      expect(storageUtil.get('nonexistent')).toBe(null);
    });

    it('should handle JSON storage', () => {
      const jsonStorage = {
        get: <T>(key: string, defaultValue: T): T => {
          try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
          } catch {
            return defaultValue;
          }
        },
        set: <T>(key: string, value: T): boolean => {
          try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
          } catch {
            return false;
          }
        }
      };

      const testData = { name: 'Test', count: 42, active: true };
      
      expect(jsonStorage.set('testData', testData)).toBe(true);
      expect(jsonStorage.get('testData', {})).toEqual(testData);
      expect(jsonStorage.get('missing', { default: true })).toEqual({ default: true });
    });

    it('should implement simple cache with TTL', () => {
      class SimpleCache<T> {
        private cache = new Map<string, { value: T; expires: number }>();

        set(key: string, value: T, ttlMs: number = 60000): void {
          this.cache.set(key, { value, expires: Date.now() + ttlMs });
        }

        get(key: string): T | null {
          const item = this.cache.get(key);
          if (!item) return null;
          
          if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
          }
          
          return item.value;
        }

        has(key: string): boolean {
          return this.get(key) !== null;
        }

        delete(key: string): void {
          this.cache.delete(key);
        }

        clear(): void {
          this.cache.clear();
        }
      }

      const cache = new SimpleCache<string>();
      
      cache.set('test', 'value', 1000);
      expect(cache.get('test')).toBe('value');
      expect(cache.has('test')).toBe(true);
      
      cache.set('expired', 'value', -1); // Already expired
      expect(cache.get('expired')).toBe(null);
      expect(cache.has('expired')).toBe(false);
      
      cache.delete('test');
      expect(cache.get('test')).toBe(null);
    });
  });

  describe('Performance and Optimization Utilities', () => {
    it('should implement debounce function', () => {
      const debounce = <T extends (...args: any[]) => any>(
        func: T,
        delay: number
      ): (...args: Parameters<T>) => void => {
        let timeoutId: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func(...args), delay);
        };
      };

      const mockFn = vi.fn();
      const debouncedFn = debounce(mockFn, 100);

      // Call multiple times rapidly
      debouncedFn('call1');
      debouncedFn('call2');
      debouncedFn('call3');

      // Should not be called yet
      expect(mockFn).not.toHaveBeenCalled();

      // Wait for debounce delay
      return new Promise<void>(resolve => {
        setTimeout(() => {
          expect(mockFn).toHaveBeenCalledOnce();
          expect(mockFn).toHaveBeenCalledWith('call3');
          resolve();
        }, 150);
      });
    });

    it('should implement throttle function', () => {
      const throttle = <T extends (...args: any[]) => any>(
        func: T,
        delay: number
      ): (...args: Parameters<T>) => void => {
        let lastCall = 0;
        return (...args: Parameters<T>) => {
          const now = Date.now();
          if (now - lastCall >= delay) {
            lastCall = now;
            func(...args);
          }
        };
      };

      const mockFn = vi.fn();
      const throttledFn = throttle(mockFn, 100);

      // Call multiple times
      throttledFn('call1');
      throttledFn('call2'); // Should be ignored
      throttledFn('call3'); // Should be ignored

      expect(mockFn).toHaveBeenCalledOnce();
      expect(mockFn).toHaveBeenCalledWith('call1');
    });

    it('should measure execution time', async () => {
      const measureTime = async <T>(
        operation: () => Promise<T>
      ): Promise<{ result: T; duration: number }> => {
        const start = performance.now();
        const result = await operation();
        const duration = performance.now() - start;
        return { result, duration };
      };

      const slowOperation = () => new Promise<string>(resolve => {
        setTimeout(() => resolve('done'), 50);
      });

      const { result, duration } = await measureTime(slowOperation);
      
      expect(result).toBe('done');
      expect(duration).toBeGreaterThan(40); // Allow some variance
      expect(duration).toBeLessThan(100);
    });
  });

  describe('Error Handling Utilities', () => {
    it('should create error with context', () => {
      class ContextualError extends Error {
        constructor(
          message: string,
          public context: Record<string, any> = {},
          public code?: string
        ) {
          super(message);
          this.name = 'ContextualError';
        }

        toString(): string {
          return `${this.name}: ${this.message} (${JSON.stringify(this.context)})`;
        }
      }

      const error = new ContextualError(
        'Operation failed',
        { userId: '123', operation: 'update' },
        'OP_FAILED'
      );

      expect(error.message).toBe('Operation failed');
      expect(error.context).toEqual({ userId: '123', operation: 'update' });
      expect(error.code).toBe('OP_FAILED');
      expect(error.toString()).toContain('ContextualError');
    });

    it('should handle async errors with retry', async () => {
      const retryAsync = async <T>(
        operation: () => Promise<T>,
        maxRetries: number = 3,
        delay: number = 100
      ): Promise<T> => {
        let lastError: Error;
        
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            return await operation();
          } catch (error) {
            lastError = error as Error;
            if (attempt < maxRetries) {
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        }
        
        throw lastError!;
      };

      let attemptCount = 0;
      const flakyOperation = () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error(`Attempt ${attemptCount} failed`);
        }
        return Promise.resolve('success');
      };

      const result = await retryAsync(flakyOperation, 3, 10);
      expect(result).toBe('success');
      expect(attemptCount).toBe(3);
    });
  });
});