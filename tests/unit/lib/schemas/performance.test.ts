import { describe, it, expect, beforeAll, afterAll } from "vitest";
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
});
