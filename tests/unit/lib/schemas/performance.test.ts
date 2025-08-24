import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { contactSchema } from '@/lib/schemas/contact';
import { rsvpSchema } from '@/lib/schemas/rsvp';
import { triviaScoreSchema } from '@/lib/schemas/trivia';
import { voterSchema, preOrderDataSchema, votingRequestSchema } from '@/lib/schemas/voting';
import { createMerchandiseSchema, merchandiseQuerySchema } from '@/lib/schemas/merchandise';
import { createOrderSchema, orderQuerySchema } from '@/lib/schemas/orders';
import { userUpdateSchema, matchSchema, userQuerySchema } from '@/lib/schemas/admin';

describe('Performance and Load Testing', () => {
  let performanceMetrics: {
    schema: string;
    operations: number;
    totalTime: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
  }[] = [];

  beforeAll(() => {
    // Warm up V8 engine
    for (let i = 0; i < 100; i++) {
      contactSchema.parse({
        name: 'Warmup User',
        email: 'warmup@example.com',
        phone: '+34-123-456-789',
        type: 'general',
        subject: 'Warmup',
        message: 'Warmup message'
      });
    }
  });

  afterAll(() => {
    console.table(performanceMetrics);
  });

  const measureSchemaPerformance = (
    schemaName: string,
    schema: any,
    testData: any,
    iterations: number = 10000
  ) => {
    const times: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();
      schema.parse(testData);
      const end = performance.now();
      times.push(end - start);
    }

    const totalTime = times.reduce((a, b) => a + b, 0);
    const avgTime = totalTime / iterations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    performanceMetrics.push({
      schema: schemaName,
      operations: iterations,
      totalTime,
      avgTime,
      minTime,
      maxTime
    });

    return { totalTime, avgTime, minTime, maxTime };
  };

  describe('Individual Schema Performance', () => {
    it('should validate contact schema performance', () => {
      const testData = {
        name: 'Performance Test User',
        email: 'perf.test@example.com',
        phone: '+34-666-777-888',
        type: 'general' as const,
        subject: 'Performance Test Subject',
        message: 'This is a performance test message to measure validation speed.'
      };

      const metrics = measureSchemaPerformance('contactSchema', contactSchema, testData);
      
      expect(metrics.avgTime).toBeLessThan(1); // Should be sub-millisecond
      expect(metrics.maxTime).toBeLessThan(20); // Even worst case should be fast (adjusted for CI environments)
    });

    it('should validate RSVP schema performance', () => {
      const testData = {
        name: 'RSVP Performance User',
        email: 'rsvp.perf@example.com',
        attendees: 3,
        message: 'Performance test RSVP message'
      };

      const metrics = measureSchemaPerformance('rsvpSchema', rsvpSchema, testData);
      
      expect(metrics.avgTime).toBeLessThan(1);
      expect(metrics.maxTime).toBeLessThan(10); // Increased for slower systems
    });

    it('should validate trivia schema performance', () => {
      const testData = { score: 75 };

      const metrics = measureSchemaPerformance('triviaScoreSchema', triviaScoreSchema, testData);
      
      expect(metrics.avgTime).toBeLessThan(0.5); // Should be very fast for simple schema
      expect(metrics.maxTime).toBeLessThan(15); // Allow for occasional spikes and CI variations
    });

    it('should validate voter schema performance', () => {
      const testData = {
        name: 'Voter Performance User',
        email: 'voter.perf@example.com'
      };

      const metrics = measureSchemaPerformance('voterSchema', voterSchema, testData);
      
      expect(metrics.avgTime).toBeLessThan(1);
      expect(metrics.maxTime).toBeLessThan(20); // Increased for slower systems and CI environments
    });

    it('should validate merchandise schema performance', () => {
      const testData = {
        name: 'Performance Test Product',
        description: 'This is a performance test product description with sufficient length.',
        price: 79.99,
        category: 'clothing' as const,
        inStock: true,
        featured: false
      };

      const metrics = measureSchemaPerformance('createMerchandiseSchema', createMerchandiseSchema, testData);
      
      expect(metrics.avgTime).toBeLessThan(5); // Increased threshold for complex schema
      expect(metrics.maxTime).toBeLessThan(20);
    });

    it('should validate order schema performance', () => {
      const testData = {
        productId: 'perf_test_product_123',
        productName: 'Performance Test Product',
        price: 85.50,
        quantity: 2,
        totalPrice: 171.00,
        customerInfo: {
          name: 'Order Performance User',
          email: 'order.perf@example.com',
          phone: '+34-987-654-321',
          contactMethod: 'email' as const
        },
        isPreOrder: false,
        orderDetails: {
          size: 'L',
          message: 'Performance test order message'
        }
      };

      const metrics = measureSchemaPerformance('createOrderSchema', createOrderSchema, testData);
      
      expect(metrics.avgTime).toBeLessThan(2); // More complex schema, slightly higher threshold
      expect(metrics.maxTime).toBeLessThan(50); // Much higher for the most complex schema
    });

    it('should validate admin schema performance', () => {
      const testData = {
        userId: 'perf_test_user_12345',
        role: 'moderator' as const,
        banned: false
      };

      const metrics = measureSchemaPerformance('userUpdateSchema', userUpdateSchema, testData);
      
      expect(metrics.avgTime).toBeLessThan(1);
      expect(metrics.maxTime).toBeLessThan(15); // Increased for slower systems
    });
  });

  describe('Concurrent Validation Performance', () => {
    it('should handle concurrent contact form validations', async () => {
      const concurrentTests = 100;
      const promises = Array.from({ length: concurrentTests }, (_, i) => 
        Promise.resolve(contactSchema.parse({
          name: `Concurrent User ${i}`,
          email: `concurrent${i}@example.com`,
          phone: '+34-123-456-789',
          type: 'general',
          subject: `Concurrent Test ${i}`,
          message: `This is concurrent test message number ${i}`
        }))
      );

      const startTime = performance.now();
      const results = await Promise.all(promises);
      const endTime = performance.now();

      expect(results).toHaveLength(concurrentTests);
      expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    });

    it('should handle mixed schema validations concurrently', async () => {
      const mixedOperations = Array.from({ length: 50 }, (_, i) => [
        Promise.resolve(contactSchema.parse({
          name: `Mixed User ${i}`,
          email: `mixed${i}@example.com`,
          phone: '+34-123-456-789',
          type: 'general',
          subject: `Mixed Test ${i}`,
          message: `Mixed test message ${i}`
        })),
        Promise.resolve(rsvpSchema.parse({
          name: `RSVP User ${i}`,
          email: `rsvp${i}@example.com`,
          attendees: (i % 5) + 1,
          message: `RSVP message ${i}`
        })),
        Promise.resolve(triviaScoreSchema.parse({
          score: i % 101
        }))
      ]).flat();

      const startTime = performance.now();
      const results = await Promise.all(mixedOperations);
      const endTime = performance.now();

      expect(results).toHaveLength(150); // 50 * 3 operations
      expect(endTime - startTime).toBeLessThan(200);
    });
  });

  describe('Memory Usage and Garbage Collection', () => {
    it('should not create memory leaks during repeated validations', () => {
      const iterations = 10000;
      const testData = {
        name: 'Memory Test User',
        email: 'memory@example.com',
        phone: '+34-123-456-789',
        type: 'general' as const,
        subject: 'Memory Test',
        message: 'Testing memory usage patterns'
      };

      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }

      const initialMemory = process.memoryUsage().heapUsed;

      for (let i = 0; i < iterations; i++) {
        contactSchema.parse(testData);
      }

      // Force garbage collection again
      if (global.gc) {
        global.gc();
      }

      const finalMemory = process.memoryUsage().heapUsed;
      const memoryDiff = finalMemory - initialMemory;

      // Memory usage shouldn't grow significantly
      expect(memoryDiff).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
    });

    it('should handle large data sets efficiently', () => {
      const largeMessage = 'A'.repeat(999); // Just under the 1000 char limit
      const testData = {
        name: 'Large Data User',
        email: 'largedata@example.com',
        phone: '+34-123-456-789',
        type: 'general' as const,
        subject: 'Large Data Test',
        message: largeMessage
      };

      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        contactSchema.parse(testData);
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;
      const avgTime = totalTime / iterations;

      expect(avgTime).toBeLessThan(2); // Should still be fast with large data
    });
  });

  describe('Stress Testing', () => {
    it('should handle burst validation requests', () => {
      const burstSize = 1000;
      const testData = {
        name: 'Burst Test User',
        email: 'burst@example.com',
        phone: '+34-123-456-789',
        type: 'general' as const,
        subject: 'Burst Test',
        message: 'Testing burst capacity'
      };

      const startTime = performance.now();
      
      for (let i = 0; i < burstSize; i++) {
        const result = contactSchema.parse(testData);
        expect(result.name).toBe('Burst Test User');
      }

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      expect(totalTime).toBeLessThan(100); // Should handle burst in under 100ms
    });

    it('should maintain performance under continuous load', () => {
      const loadDuration = 1000; // 1 second
      const startTime = performance.now();
      let operations = 0;

      const testData = {
        name: 'Load Test User',
        email: 'load@example.com',
        phone: '+34-123-456-789',
        type: 'general' as const,
        subject: 'Load Test',
        message: 'Testing continuous load'
      };

      while (performance.now() - startTime < loadDuration) {
        contactSchema.parse(testData);
        operations++;
      }

      const actualDuration = performance.now() - startTime;
      const operationsPerSecond = operations / (actualDuration / 1000);

      expect(operationsPerSecond).toBeGreaterThan(1000); // Should handle 1000+ ops/sec
    });
  });

  describe('Complex Validation Scenarios', () => {
    it('should handle complex voting request validation efficiently', () => {
      const voteRequest = {
        action: 'vote' as const,
        designId: 'design_123',
        voter: {
          name: 'Complex Vote User',
          email: 'vote@example.com'
        }
      };

      const preOrderRequest = {
        action: 'preOrder' as const,
        orderData: {
          name: 'PreOrder User',
          email: 'preorder@example.com',
          size: 'L' as const,
          quantity: 2,
          message: 'Complex pre-order request'
        }
      };

      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        if (i % 2 === 0) {
          votingRequestSchema.parse(voteRequest);
        } else {
          votingRequestSchema.parse(preOrderRequest);
        }
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;

      expect(avgTime).toBeLessThan(2); // Complex discriminated unions should still be fast
    });

    it('should handle query schema transformations efficiently', () => {
      const queryData = { limit: '50', offset: '100' };
      const iterations = 5000;

      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        const result = userQuerySchema.parse(queryData);
        expect(result.limit).toBe(50);
        expect(result.offset).toBe(100);
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;

      expect(avgTime).toBeLessThan(1); // String to number transformations should be fast
    });
  });

  describe('Error Handling Performance', () => {
    it('should handle validation errors efficiently', () => {
      const invalidData = {
        name: 'A', // Too short
        email: 'invalid-email', // Invalid format
        phone: '123', // Too short
        type: 'general' as const,
        subject: 'AB', // Too short
        message: 'ABC' // Too short
      };

      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        try {
          contactSchema.parse(invalidData);
        } catch (error) {
          // Expected to throw
          expect(error).toBeDefined();
        }
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;

      expect(avgTime).toBeLessThan(3); // Error cases might be slightly slower but should still be fast
    });

    it('should handle mixed valid and invalid data efficiently', () => {
      const validData = {
        name: 'Valid User',
        email: 'valid@example.com',
        phone: '+34-123-456-789',
        type: 'general' as const,
        subject: 'Valid Subject',
        message: 'Valid message content'
      };

      const invalidData = {
        name: 'A',
        email: 'invalid',
        phone: '123',
        type: 'general' as const,
        subject: 'AB',
        message: 'ABC'
      };

      const iterations = 1000;
      const startTime = performance.now();

      for (let i = 0; i < iterations; i++) {
        if (i % 2 === 0) {
          const result = contactSchema.parse(validData);
          expect(result.name).toBe('Valid User');
        } else {
          try {
            contactSchema.parse(invalidData);
          } catch (error) {
            expect(error).toBeDefined();
          }
        }
      }

      const endTime = performance.now();
      const avgTime = (endTime - startTime) / iterations;

      expect(avgTime).toBeLessThan(2);
    });
  });

  describe('Scalability Testing', () => {
    it('should scale linearly with input complexity', () => {
      const simpleData = {
        name: 'Simple',
        email: 'simple@example.com',
        subject: 'Simple',
        message: 'Simple message'
      };

      const complexData = {
        name: 'Very Complex User Name With Many Words',
        email: 'very.complex.email.address@long.domain.name.example.com',
        phone: '+34-123-456-789',
        type: 'merchandise' as const,
        subject: 'Very Complex Subject With Many Words And Details About The Request',
        message: 'This is a very complex message with lots of details and information that needs to be validated carefully to ensure all constraints are met and the data is properly processed by the system.'
      };

      const iterations = 1000;

      // Test simple data
      const simpleStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        contactSchema.parse(simpleData);
      }
      const simpleEnd = performance.now();
      const simpleTime = simpleEnd - simpleStart;

      // Test complex data
      const complexStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        contactSchema.parse(complexData);
      }
      const complexEnd = performance.now();
      const complexTime = complexEnd - complexStart;

      // Complex data should not be significantly slower (less than 9x)
      expect(complexTime / simpleTime).toBeLessThan(9);
    });

    it('should handle varying load patterns efficiently', () => {
      const testPatterns = [
        { name: 'Low load', operations: 100, expectedTime: 50 },
        { name: 'Medium load', operations: 500, expectedTime: 200 },
        { name: 'High load', operations: 1000, expectedTime: 400 }
      ];

      testPatterns.forEach(({ name, operations, expectedTime }) => {
        const testData = {
          name: `${name} User`,
          email: 'pattern@example.com',
          phone: '+34-123-456-789',
          type: 'general' as const,
          subject: `${name} Subject`,
          message: `${name} message content`
        };

        const startTime = performance.now();
        
        for (let i = 0; i < operations; i++) {
          contactSchema.parse(testData);
        }

        const endTime = performance.now();
        const actualTime = endTime - startTime;

        expect(actualTime).toBeLessThan(expectedTime);
      });
    });
  });
});