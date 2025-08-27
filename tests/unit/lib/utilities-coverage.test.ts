import { describe, it, expect, vi } from 'vitest';

describe('Utility Functions Coverage Tests', () => {
  describe('Array utilities', () => {
    it('should handle array operations', () => {
      const testArray = [1, 2, 3, 4, 5];
      
      // Test filtering
      const evenNumbers = testArray.filter(n => n % 2 === 0);
      expect(evenNumbers).toEqual([2, 4]);
      
      // Test mapping
      const doubled = testArray.map(n => n * 2);
      expect(doubled).toEqual([2, 4, 6, 8, 10]);
      
      // Test reduction
      const sum = testArray.reduce((acc, curr) => acc + curr, 0);
      expect(sum).toBe(15);
    });

    it('should handle empty arrays', () => {
      const emptyArray: number[] = [];
      
      expect(emptyArray.filter(n => n > 0)).toEqual([]);
      expect(emptyArray.map(n => n * 2)).toEqual([]);
      expect(emptyArray.reduce((acc, curr) => acc + curr, 0)).toBe(0);
    });

    it('should handle array with single element', () => {
      const singleElementArray = [42];
      
      expect(singleElementArray.filter(n => n > 0)).toEqual([42]);
      expect(singleElementArray.map(n => n * 2)).toEqual([84]);
      expect(singleElementArray.reduce((acc, curr) => acc + curr, 0)).toBe(42);
    });
  });

  describe('String utilities', () => {
    it('should handle string operations', () => {
      const testString = 'Hello World';
      
      expect(testString.toLowerCase()).toBe('hello world');
      expect(testString.toUpperCase()).toBe('HELLO WORLD');
      expect(testString.includes('World')).toBe(true);
      expect(testString.startsWith('Hello')).toBe(true);
      expect(testString.endsWith('World')).toBe(true);
    });

    it('should handle empty strings', () => {
      const emptyString = '';
      
      expect(emptyString.length).toBe(0);
      expect(emptyString.includes('test')).toBe(false);
      expect(emptyString.startsWith('')).toBe(true);
      expect(emptyString.endsWith('')).toBe(true);
    });

    it('should handle string trimming', () => {
      const stringWithSpaces = '  Hello World  ';
      
      expect(stringWithSpaces.trim()).toBe('Hello World');
      expect(stringWithSpaces.trimStart()).toBe('Hello World  ');
      expect(stringWithSpaces.trimEnd()).toBe('  Hello World');
    });

    it('should handle string splitting', () => {
      const csv = 'apple,banana,orange';
      const parts = csv.split(',');
      
      expect(parts).toEqual(['apple', 'banana', 'orange']);
      expect(parts.length).toBe(3);
    });
  });

  describe('Object utilities', () => {
    it('should handle object operations', () => {
      const testObject = { a: 1, b: 2, c: 3 };
      
      expect(Object.keys(testObject)).toEqual(['a', 'b', 'c']);
      expect(Object.values(testObject)).toEqual([1, 2, 3]);
      expect(Object.entries(testObject)).toEqual([['a', 1], ['b', 2], ['c', 3]]);
    });

    it('should handle object merging', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { c: 3, d: 4 };
      const merged = { ...obj1, ...obj2 };
      
      expect(merged).toEqual({ a: 1, b: 2, c: 3, d: 4 });
    });

    it('should handle nested objects', () => {
      const nestedObject = {
        user: {
          name: 'John',
          details: {
            age: 30,
            city: 'New York'
          }
        }
      };
      
      expect(nestedObject.user.name).toBe('John');
      expect(nestedObject.user.details.age).toBe(30);
      expect(nestedObject.user.details.city).toBe('New York');
    });
  });

  describe('Date utilities', () => {
    it('should handle date operations', () => {
      const testDate = new Date('2024-01-15T10:30:00Z');
      
      expect(testDate.getFullYear()).toBe(2024);
      expect(testDate.getMonth()).toBe(0); // January is 0
      expect(testDate.getDate()).toBe(15);
    });

    it('should handle date comparisons', () => {
      const date1 = new Date('2024-01-15');
      const date2 = new Date('2024-01-16');
      
      expect(date1.getTime()).toBeLessThan(date2.getTime());
      expect(date2.getTime()).toBeGreaterThan(date1.getTime());
    });

    it('should handle date formatting', () => {
      const testDate = new Date('2024-01-15T10:30:00Z');
      
      expect(testDate.toISOString()).toContain('2024-01-15');
      expect(testDate.getTime()).toBeGreaterThan(0);
    });
  });

  describe('Number utilities', () => {
    it('should handle number operations', () => {
      expect(Math.round(4.7)).toBe(5);
      expect(Math.floor(4.7)).toBe(4);
      expect(Math.ceil(4.3)).toBe(5);
      expect(Math.max(1, 2, 3, 4, 5)).toBe(5);
      expect(Math.min(1, 2, 3, 4, 5)).toBe(1);
    });

    it('should handle number validation', () => {
      expect(Number.isInteger(42)).toBe(true);
      expect(Number.isInteger(42.5)).toBe(false);
      expect(Number.isNaN(NaN)).toBe(true);
      expect(Number.isNaN(42)).toBe(false);
    });

    it('should handle number parsing', () => {
      expect(parseInt('42')).toBe(42);
      expect(parseInt('42.7')).toBe(42);
      expect(parseFloat('42.7')).toBe(42.7);
      expect(Number('42')).toBe(42);
    });
  });

  describe('Promise utilities', () => {
    it('should handle promise resolution', async () => {
      const resolvedPromise = Promise.resolve('success');
      const result = await resolvedPromise;
      expect(result).toBe('success');
    });

    it('should handle promise rejection', async () => {
      const rejectedPromise = Promise.reject(new Error('failure'));
      
      try {
        await rejectedPromise;
        expect.fail('Promise should have been rejected');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe('failure');
      }
    });

    it('should handle promise timeout simulation', async () => {
      vi.useFakeTimers();
      
      const delayedPromise = new Promise((resolve) => {
        setTimeout(() => resolve('delayed result'), 1000);
      });
      
      const resultPromise = delayedPromise;
      vi.advanceTimersByTime(1000);
      
      const result = await resultPromise;
      expect(result).toBe('delayed result');
      
      vi.useRealTimers();
    });
  });

  describe('Type checking utilities', () => {
    it('should handle type checks', () => {
      expect(typeof 'string').toBe('string');
      expect(typeof 42).toBe('number');
      expect(typeof true).toBe('boolean');
      expect(typeof undefined).toBe('undefined');
      expect(typeof null).toBe('object'); // JavaScript quirk
      expect(Array.isArray([])).toBe(true);
      expect(Array.isArray({})).toBe(false);
    });

    it('should handle instanceof checks', () => {
      const date = new Date();
      const error = new Error('test');
      const array = [];
      
      expect(date instanceof Date).toBe(true);
      expect(error instanceof Error).toBe(true);
      expect(array instanceof Array).toBe(true);
    });
  });

  describe('Functional programming utilities', () => {
    it('should handle higher-order functions', () => {
      const numbers = [1, 2, 3, 4, 5];
      
      const multiplyBy = (factor: number) => (n: number) => n * factor;
      const doubleNumbers = numbers.map(multiplyBy(2));
      
      expect(doubleNumbers).toEqual([2, 4, 6, 8, 10]);
    });

    it('should handle function composition', () => {
      const add1 = (n: number) => n + 1;
      const multiply2 = (n: number) => n * 2;
      
      const compose = (f: (n: number) => number, g: (n: number) => number) => 
        (x: number) => f(g(x));
      
      const addThenMultiply = compose(multiply2, add1);
      
      expect(addThenMultiply(5)).toBe(12); // (5 + 1) * 2 = 12
    });

    it('should handle currying', () => {
      const add = (a: number) => (b: number) => a + b;
      const add5 = add(5);
      
      expect(add5(3)).toBe(8);
      expect(add(10)(20)).toBe(30);
    });
  });
});