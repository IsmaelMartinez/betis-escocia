import { describe, it, expect } from 'vitest';
import { triviaScoreSchema, type TriviaScoreData } from '@/lib/schemas/trivia';
import { ZodError } from 'zod';

describe('Trivia Schema', () => {
  describe('triviaScoreSchema', () => {
    describe('Valid cases', () => {
      it('should validate minimum score (0)', () => {
        const result = triviaScoreSchema.parse({ score: 0 });
        expect(result.score).toBe(0);
      });

      it('should validate maximum score (100)', () => {
        const result = triviaScoreSchema.parse({ score: 100 });
        expect(result.score).toBe(100);
      });

      it('should validate mid-range scores', () => {
        const validScores = [1, 25, 50, 75, 99];
        
        validScores.forEach(score => {
          const result = triviaScoreSchema.parse({ score });
          expect(result.score).toBe(score);
        });
      });

      it('should validate typical game scores', () => {
        // Typical scores for a 5-question game
        const gameScores = [1, 2, 3, 4, 5];
        
        gameScores.forEach(score => {
          const result = triviaScoreSchema.parse({ score });
          expect(result.score).toBe(score);
        });
      });
    });

    describe('Invalid cases - Score range validation', () => {
      it('should reject negative scores', () => {
        expect(() => triviaScoreSchema.parse({ score: -1 })).toThrow(ZodError);
        
        try {
          triviaScoreSchema.parse({ score: -1 });
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('La puntuación debe ser mayor o igual a 0');
        }
      });

      it('should reject scores above 100', () => {
        expect(() => triviaScoreSchema.parse({ score: 101 })).toThrow(ZodError);
        
        try {
          triviaScoreSchema.parse({ score: 101 });
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('La puntuación no puede exceder 100');
        }
      });

      it('should reject large invalid scores', () => {
        const invalidScores = [150, 500, 1000];
        
        invalidScores.forEach(score => {
          expect(() => triviaScoreSchema.parse({ score })).toThrow(ZodError);
          
          try {
            triviaScoreSchema.parse({ score });
          } catch (error) {
            expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('La puntuación no puede exceder 100');
          }
        });
      });
    });

    describe('Invalid cases - Integer validation', () => {
      it('should reject decimal scores', () => {
        const decimalScores = [1.5, 2.7, 50.5, 99.9];
        
        decimalScores.forEach(score => {
          expect(() => triviaScoreSchema.parse({ score })).toThrow(ZodError);
          
          try {
            triviaScoreSchema.parse({ score });
          } catch (error) {
            expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues?.[0]?.message).toBe('La puntuación debe ser un número entero');
          }
        });
      });
    });

    describe('Invalid cases - Type validation', () => {
      it('should reject string scores', () => {
        expect(() => triviaScoreSchema.parse({ score: '50' })).toThrow(ZodError);
      });

      it('should reject boolean scores', () => {
        expect(() => triviaScoreSchema.parse({ score: true })).toThrow(ZodError);
      });

      it('should reject null scores', () => {
        expect(() => triviaScoreSchema.parse({ score: null })).toThrow(ZodError);
      });

      it('should reject undefined scores', () => {
        expect(() => triviaScoreSchema.parse({ score: undefined })).toThrow(ZodError);
      });

      it('should reject missing score field', () => {
        expect(() => triviaScoreSchema.parse({})).toThrow(ZodError);
      });

      it('should reject array scores', () => {
        expect(() => triviaScoreSchema.parse({ score: [50] })).toThrow(ZodError);
      });

      it('should reject object scores', () => {
        expect(() => triviaScoreSchema.parse({ score: { value: 50 } })).toThrow(ZodError);
      });
    });

    describe('Edge cases', () => {
      it('should handle zero correctly', () => {
        const result = triviaScoreSchema.parse({ score: 0 });
        expect(result.score).toBe(0);
      });

      it('should handle integer-like floats correctly', () => {
        // JavaScript treats 50.0 as an integer, so this should pass
        const result = triviaScoreSchema.parse({ score: 50.0 });
        expect(result.score).toBe(50);
        
        // But decimals should fail
        expect(() => triviaScoreSchema.parse({ score: 50.5 })).toThrow(ZodError);
      });
    });

    describe('Type inference', () => {
      it('should infer correct TypeScript type', () => {
        const validData: TriviaScoreData = { score: 50 };
        const result = triviaScoreSchema.parse(validData);
        
        // TypeScript should infer the correct type
        expect(typeof result.score).toBe('number');
        expect(result.score).toBe(50);
      });
    });

    describe('Schema properties', () => {
      it('should have correct schema structure', () => {
        // Test that the schema has the expected shape
        expect(triviaScoreSchema.shape).toBeDefined();
        expect(triviaScoreSchema.shape.score).toBeDefined();
      });

      it('should provide detailed error information', () => {
        try {
          triviaScoreSchema.parse({ score: 'invalid' });
        } catch (error) {
          expect(error).toBeInstanceOf(ZodError);
          const zodError = error as ZodError;
          expect(zodError.issues).toBeDefined();
          expect(zodError.issues).toHaveLength(1);
          expect(zodError.issues?.[0]?.path).toEqual(['score']);
          expect(zodError.issues?.[0]?.code).toBeDefined();
        }
      });
    });

    describe('Real-world scenarios', () => {
      it('should handle typical trivia game flow', () => {
        // Simulate a 5-question trivia game where user gets 3 correct
        const gameScore = 3;
        const result = triviaScoreSchema.parse({ score: gameScore });
        expect(result.score).toBe(3);
      });

      it('should handle perfect game scenario', () => {
        // User gets all questions correct in a percentage-based system
        const perfectScore = 100;
        const result = triviaScoreSchema.parse({ score: perfectScore });
        expect(result.score).toBe(100);
      });

      it('should handle worst case scenario', () => {
        // User gets no questions correct
        const worstScore = 0;
        const result = triviaScoreSchema.parse({ score: worstScore });
        expect(result.score).toBe(0);
      });
    });

    describe('Game Logic and Statistical Tests', () => {
      it('should handle score calculations for different question counts', () => {
        // 3-question game (current format)
        const threeQuestionScores = [0, 1, 2, 3];
        threeQuestionScores.forEach(score => {
          const result = triviaScoreSchema.parse({ score });
          expect(result.score).toBe(score);
        });

        // 5-question game  
        const fiveQuestionScores = [0, 1, 2, 3, 4, 5];
        fiveQuestionScores.forEach(score => {
          const result = triviaScoreSchema.parse({ score });
          expect(result.score).toBe(score);
        });

        // Percentage-based scoring
        const percentageScores = [0, 25, 50, 75, 100];
        percentageScores.forEach(score => {
          const result = triviaScoreSchema.parse({ score });
          expect(result.score).toBe(score);
        });
      });

      it('should validate scores from simulated game sessions', () => {
        // Simulate 100 random game results
        for (let i = 0; i < 100; i++) {
          const randomScore = Math.floor(Math.random() * 101); // 0-100
          const result = triviaScoreSchema.parse({ score: randomScore });
          expect(result.score).toBe(randomScore);
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(100);
        }
      });

      it('should handle leaderboard score ranges', () => {
        const leaderboardScores = [100, 95, 90, 85, 80, 75, 70, 65, 60];
        leaderboardScores.forEach(score => {
          const result = triviaScoreSchema.parse({ score });
          expect(result.score).toBe(score);
        });
      });
    });

    describe('Data Integrity and Edge Cases', () => {
      it('should handle score precision edge cases', () => {
        // Test floating point precision issues
        const precisionTests = [
          { input: 0.0, expected: 0 },
          { input: 1.0, expected: 1 },
          { input: 50.0, expected: 50 },
          { input: 100.0, expected: 100 }
        ];

        precisionTests.forEach(({ input, expected }) => {
          const result = triviaScoreSchema.parse({ score: input });
          expect(result.score).toBe(expected);
        });
      });

      it('should reject mathematical edge cases', () => {
        const invalidMathValues = [
          Number.POSITIVE_INFINITY,
          Number.NEGATIVE_INFINITY,
          Number.NaN,
          Math.PI * 100, // > 100
          Math.E * -100 // < 0
        ];

        invalidMathValues.forEach(value => {
          expect(() => triviaScoreSchema.parse({ score: value })).toThrow(ZodError);
        });
      });

      it('should handle extreme boundary testing', () => {
        // Test values very close to boundaries
        const boundaryTests = [
          { score: 0.1, shouldFail: true }, // Just above 0 but not integer
          { score: 99.9, shouldFail: true }, // Just below 100 but not integer
          { score: -0.1, shouldFail: true }, // Just below 0
          { score: 100.1, shouldFail: true } // Just above 100
        ];

        boundaryTests.forEach(({ score, shouldFail }) => {
          if (shouldFail) {
            expect(() => triviaScoreSchema.parse({ score })).toThrow(ZodError);
          } else {
            const result = triviaScoreSchema.parse({ score });
            expect(result.score).toBe(score);
          }
        });
      });
    });

    describe('Performance and Stress Testing', () => {
      it('should handle rapid score validation', () => {
        const startTime = performance.now();
        
        for (let i = 0; i <= 100; i++) {
          triviaScoreSchema.parse({ score: i });
        }
        
        const endTime = performance.now();
        expect(endTime - startTime).toBeLessThan(50); // Should be very fast
      });

      it('should handle concurrent validations', async () => {
        const promises = Array.from({ length: 1000 }, (_, i) => 
          Promise.resolve(triviaScoreSchema.parse({ score: i % 101 }))
        );

        const results = await Promise.all(promises);
        expect(results).toHaveLength(1000);
        
        results.forEach((result, i) => {
          expect(result.score).toBe(i % 101);
        });
      });

      it('should maintain consistency across multiple validations', () => {
        const testScore = 75;
        const iterations = 10000;

        for (let i = 0; i < iterations; i++) {
          const result = triviaScoreSchema.parse({ score: testScore });
          expect(result.score).toBe(testScore);
        }
      });
    });

    describe('Statistical Distribution Tests', () => {
      it('should validate scores following normal distribution', () => {
        // Simulate scores with normal distribution (mean=50, std=15)
        const normalScores = [];
        for (let i = 0; i < 100; i++) {
          const normalScore = Math.max(0, Math.min(100, 
            Math.round(50 + (Math.random() - 0.5) * 30)
          ));
          normalScores.push(normalScore);
        }

        normalScores.forEach(score => {
          const result = triviaScoreSchema.parse({ score });
          expect(result.score).toBe(score);
          expect(result.score).toBeGreaterThanOrEqual(0);
          expect(result.score).toBeLessThanOrEqual(100);
        });

        // Verify distribution characteristics
        const mean = normalScores.reduce((a, b) => a + b) / normalScores.length;
        expect(mean).toBeGreaterThan(30);
        expect(mean).toBeLessThan(70);
      });

      it('should handle extreme score distributions', () => {
        // All minimum scores
        const minScores = Array(50).fill(0);
        minScores.forEach(score => {
          const result = triviaScoreSchema.parse({ score });
          expect(result.score).toBe(0);
        });

        // All maximum scores
        const maxScores = Array(50).fill(100);
        maxScores.forEach(score => {
          const result = triviaScoreSchema.parse({ score });
          expect(result.score).toBe(100);
        });
      });
    });

    describe('Integration with Game Mechanics', () => {
      it('should validate time-based scoring scenarios', () => {
        // Fast answers get higher scores (simulated)
        const timeBonusScores = [
          { baseScore: 1, timeBonus: 0, total: 1 },
          { baseScore: 2, timeBonus: 1, total: 3 },
          { baseScore: 3, timeBonus: 2, total: 5 }
        ];

        timeBonusScores.forEach(({ total }) => {
          const result = triviaScoreSchema.parse({ score: total });
          expect(result.score).toBe(total);
        });
      });

      it('should validate difficulty-adjusted scoring', () => {
        // Different difficulty levels might have different max scores
        const difficultyScores = [
          { difficulty: 'easy', maxScore: 3, actualScore: 2 },
          { difficulty: 'medium', maxScore: 5, actualScore: 4 },
          { difficulty: 'hard', maxScore: 7, actualScore: 5 }
        ];

        difficultyScores.forEach(({ actualScore }) => {
          const result = triviaScoreSchema.parse({ score: actualScore });
          expect(result.score).toBe(actualScore);
        });
      });
    });

    describe('Error Handling and Recovery', () => {
      it('should provide detailed error information', () => {
        const invalidInputs = [
          { input: -5, expectedMessage: 'La puntuación debe ser mayor o igual a 0' },
          { input: 105, expectedMessage: 'La puntuación no puede exceder 100' },
          { input: 50.5, expectedMessage: 'La puntuación debe ser un número entero' }
        ];

        invalidInputs.forEach(({ input, expectedMessage }) => {
          try {
            triviaScoreSchema.parse({ score: input });
            expect.fail('Should have thrown an error');
          } catch (error) {
            expect(error).toBeInstanceOf(ZodError);
            const zodError = error as ZodError;
            expect(zodError.issues?.[0]?.message).toBe(expectedMessage);
          }
        });
      });

      it('should handle malformed input gracefully', () => {
        const malformedInputs = [
          { score: 'not a number' },
          { score: null },
          { score: undefined },
          { score: {} },
          { score: [] },
          { score: true }
        ];

        malformedInputs.forEach(input => {
          expect(() => triviaScoreSchema.parse(input)).toThrow(ZodError);
        });
      });
    });
  });
});