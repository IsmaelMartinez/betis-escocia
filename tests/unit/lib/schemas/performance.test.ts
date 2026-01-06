import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { contactSchema } from "../../../../src/lib/schemas/contact";
import { rsvpSchema } from "../../../../src/lib/schemas/rsvp";
import { triviaScoreSchema } from "../../../../src/lib/schemas/trivia";
import { userUpdateSchema } from "../../../../src/lib/schemas/admin";

describe("Performance and Load Testing", () => {
  let performanceMetrics: {
    schema: string;
    operations: number;
    totalTime: number;
    avgTime: number;
    minTime: number;
    maxTime: number;
  }[] = [];

  beforeAll(() => {
    performanceMetrics = [];
  });

  afterAll(() => {
    console.table(performanceMetrics);
  });

  function measureSchemaPerformance(
    schemaName: string,
    schema: any,
    testData: any,
    operations: number = 10000,
  ) {
    const times: number[] = [];

    for (let i = 0; i < operations; i++) {
      const start = performance.now();
      schema.parse(testData);
      const end = performance.now();
      times.push(end - start);
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const avgTime = totalTime / operations;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);

    const metrics = {
      schema: schemaName,
      operations,
      totalTime,
      avgTime,
      minTime,
      maxTime,
    };

    performanceMetrics.push(metrics);
    return metrics;
  }

  describe("Individual Schema Performance", () => {
    it("should validate contact schema performance", () => {
      const testData = {
        name: "Performance Test User",
        email: "performance@example.com",
        subject: "Performance Test Subject",
        message: "This is a performance test message",
      };

      const metrics = measureSchemaPerformance(
        "contactSchema",
        contactSchema,
        testData,
      );

      expect(metrics.avgTime).toBeLessThan(1);
      // Increased threshold for CI environment variability (was 50ms, increased to 100ms)
      expect(metrics.maxTime).toBeLessThan(100);
    });

    it("should validate RSVP schema performance", () => {
      const testData = {
        name: "Performance Test User",
        email: "performance@example.com",
        attendees: 2,
        message: "Performance test notes",
        whatsappInterest: false,
      };

      const metrics = measureSchemaPerformance(
        "rsvpSchema",
        rsvpSchema,
        testData,
      );

      expect(metrics.avgTime).toBeLessThan(1);
      // Increased threshold for CI environment variability (was 50ms, increased to 100ms)
      expect(metrics.maxTime).toBeLessThan(100);
    });

    it("should validate trivia schema performance", () => {
      const testData = {
        score: 8,
        totalQuestions: 10,
        email: "performance@example.com",
        completedAt: new Date().toISOString(),
      };

      const metrics = measureSchemaPerformance(
        "triviaScoreSchema",
        triviaScoreSchema,
        testData,
      );

      expect(metrics.avgTime).toBeLessThan(1);
      // Increased threshold for CI environment variability (was 50ms, increased to 100ms)
      expect(metrics.maxTime).toBeLessThan(100);
    });

    it("should validate admin schema performance", () => {
      const testData = {
        userId: "user_performance_123",
        role: "moderator" as const,
        banned: false,
      };

      const metrics = measureSchemaPerformance(
        "userUpdateSchema",
        userUpdateSchema,
        testData,
      );

      expect(metrics.avgTime).toBeLessThan(1);
      // Increased threshold for CI environment variability (was 50ms, increased to 100ms)
      expect(metrics.maxTime).toBeLessThan(100);
    });
  });

  describe("Concurrent Validation Performance", () => {
    it("should handle concurrent contact form validations", async () => {
      const testData = {
        name: "Concurrent User",
        email: "concurrent@example.com",
        subject: "Concurrent Test",
        message: "Concurrent validation test",
      };

      const promises = Array.from({ length: 100 }, () =>
        Promise.resolve(contactSchema.parse(testData)),
      );

      const start = performance.now();
      await Promise.all(promises);
      const end = performance.now();

      const totalTime = end - start;
      expect(totalTime).toBeLessThan(100); // Should complete within 100ms
    });

    it("should handle concurrent RSVP validations", async () => {
      const testData = {
        name: "Concurrent User",
        email: "concurrent@example.com",
        attendees: 1,
        message: "Concurrent RSVP test",
        whatsappInterest: false,
      };

      const promises = Array.from({ length: 50 }, () =>
        Promise.resolve(rsvpSchema.parse(testData)),
      );

      const start = performance.now();
      await Promise.all(promises);
      const end = performance.now();

      const totalTime = end - start;
      expect(totalTime).toBeLessThan(50); // Should complete within 50ms
    });
  });

  describe("Stress Testing", () => {
    it("should maintain performance under continuous load", async () => {
      const testData = {
        name: "Stress Test User",
        email: "stress@example.com",
        subject: "Stress Test",
        message: "Continuous load test",
      };

      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        contactSchema.parse(testData);
      }

      const end = performance.now();
      const avgTimePerValidation = (end - start) / iterations;

      expect(avgTimePerValidation).toBeLessThan(1); // Should average under 1ms per validation
    }, 1000);

    it("should handle mixed schema validations efficiently", () => {
      const contactData = {
        name: "Mixed User",
        email: "mixed@example.com",
        subject: "Mixed Test",
        message: "Mixed schema test",
      };

      const rsvpData = {
        name: "Mixed User",
        email: "mixed@example.com",
        attendees: 1,
        whatsappInterest: false,
      };

      const start = performance.now();

      for (let i = 0; i < 500; i++) {
        contactSchema.parse(contactData);
        rsvpSchema.parse(rsvpData);
      }

      const end = performance.now();
      const totalTime = end - start;

      expect(totalTime).toBeLessThan(500); // 1000 validations should complete within 500ms
    });
  });
});
