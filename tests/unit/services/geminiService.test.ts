import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mocks must be hoisted
const { mockGenerateContent, mockBusinessLog, mockErrorLog } = vi.hoisted(
  () => ({
    mockGenerateContent: vi.fn(),
    mockBusinessLog: vi.fn(),
    mockErrorLog: vi.fn(),
  }),
);

// Mock @google/genai
vi.mock("@google/genai", () => ({
  GoogleGenAI: class MockGoogleGenAI {
    models = {
      generateContent: mockGenerateContent,
    };
  },
}));

// Mock logger
vi.mock("@/lib/logger", () => ({
  log: {
    business: mockBusinessLog,
    error: mockErrorLog,
  },
}));

import { analyzeRumorCredibility } from "@/services/geminiService";

describe("geminiService", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateContent.mockClear();
    mockBusinessLog.mockClear();
    mockErrorLog.mockClear();
    process.env = { ...originalEnv, GEMINI_API_KEY: "test-api-key" };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("analyzeRumorCredibility", () => {
    it("should analyze transfer rumor successfully", async () => {
      const mockResponse = {
        text: JSON.stringify({
          isTransferRumor: true,
          probability: 75,
          reasoning:
            "El rumor menciona un fichaje específico con fuentes confiables",
          confidence: "high",
        }),
      };

      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      const result = await analyzeRumorCredibility(
        "Betis cerca de fichar a nuevo delantero",
        "Fuentes cercanas al club confirman el interés",
        "BetisWeb",
      );

      expect(result.isTransferRumor).toBe(true);
      expect(result.probability).toBe(75);
      expect(result.reasoning).toBe(
        "El rumor menciona un fichaje específico con fuentes confiables",
      );
      expect(result.confidence).toBe("high");
    });

    it("should identify regular news (not transfer rumor)", async () => {
      const mockResponse = {
        text: JSON.stringify({
          isTransferRumor: false,
          probability: 0,
          reasoning: "Esta es una noticia sobre un partido, no sobre fichajes",
          confidence: "high",
        }),
      };

      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      const result = await analyzeRumorCredibility(
        "Betis gana 2-0 al Sevilla",
        "Resumen del partido",
        "Google News (General)",
      );

      expect(result.isTransferRumor).toBe(false);
      expect(result.probability).toBe(0);
    });

    it("should handle JSON response wrapped in markdown code blocks", async () => {
      const mockResponse = {
        text: '```json\n{"isTransferRumor": true, "probability": 60, "reasoning": "Test", "confidence": "medium"}\n```',
      };

      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      const result = await analyzeRumorCredibility(
        "Title",
        "Description",
        "Source",
      );

      expect(result.isTransferRumor).toBe(true);
      expect(result.probability).toBe(60);
    });

    it("should handle JSON response without markdown code blocks", async () => {
      const mockResponse = {
        text: '{"isTransferRumor": false, "probability": 0, "reasoning": "Not a transfer", "confidence": "high"}',
      };

      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      const result = await analyzeRumorCredibility(
        "Title",
        "Description",
        "Source",
      );

      expect(result.isTransferRumor).toBe(false);
      expect(result.probability).toBe(0);
    });

    it("should handle quota error (429) gracefully", async () => {
      const quotaError = new Error("429 Resource exhausted");
      mockGenerateContent.mockRejectedValueOnce(quotaError);

      const result = await analyzeRumorCredibility(
        "Title",
        "Description",
        "Source",
      );

      expect(result.isTransferRumor).toBeNull();
      expect(result.probability).toBeNull();
      expect(result.reasoning).toBe(
        "No se pudo analizar este rumor automáticamente.",
      );
      expect(result.confidence).toBe("low");
      expect(mockErrorLog).toHaveBeenCalledWith(
        "Gemini quota exceeded - storing without analysis",
        quotaError,
        expect.objectContaining({
          title: "Title",
          source: "Source",
        }),
      );
    });

    it("should handle rate limit error gracefully", async () => {
      const rateLimitError = new Error("rate limit exceeded");
      mockGenerateContent.mockRejectedValueOnce(rateLimitError);

      const result = await analyzeRumorCredibility(
        "Title",
        "Description",
        "Source",
      );

      expect(result.isTransferRumor).toBeNull();
      expect(result.probability).toBeNull();
    });

    it("should handle quota keyword in error message", async () => {
      const quotaError = new Error("quota exceeded for requests");
      mockGenerateContent.mockRejectedValueOnce(quotaError);

      const result = await analyzeRumorCredibility(
        "Title",
        "Description",
        "Source",
      );

      expect(result.isTransferRumor).toBeNull();
      expect(result.probability).toBeNull();
    });

    it("should retry on non-quota errors (attempt 1 of 3)", async () => {
      const tempError = new Error("Temporary network error");
      const successResponse = {
        text: '{"isTransferRumor": true, "probability": 50, "reasoning": "Test", "confidence": "medium"}',
      };

      mockGenerateContent
        .mockRejectedValueOnce(tempError)
        .mockResolvedValueOnce(successResponse);

      const result = await analyzeRumorCredibility(
        "Title",
        "Description",
        "Source",
      );

      expect(result.isTransferRumor).toBe(true);
      expect(result.probability).toBe(50);
      expect(mockGenerateContent).toHaveBeenCalledTimes(2);
    });

    it("should retry up to 3 times on non-quota errors", async () => {
      const tempError = new Error("Network error");
      const successResponse = {
        text: '{"isTransferRumor": true, "probability": 50, "reasoning": "Test", "confidence": "medium"}',
      };

      mockGenerateContent
        .mockRejectedValueOnce(tempError)
        .mockRejectedValueOnce(tempError)
        .mockResolvedValueOnce(successResponse);

      const result = await analyzeRumorCredibility(
        "Title",
        "Description",
        "Source",
      );

      expect(result.isTransferRumor).toBe(true);
      expect(mockGenerateContent).toHaveBeenCalledTimes(3);
    });

    it("should return null after 3 failed retry attempts", async () => {
      const tempError = new Error("Persistent error");

      mockGenerateContent
        .mockRejectedValueOnce(tempError)
        .mockRejectedValueOnce(tempError)
        .mockRejectedValueOnce(tempError);

      const result = await analyzeRumorCredibility(
        "Title",
        "Description",
        "Source",
      );

      expect(result.isTransferRumor).toBeNull();
      expect(result.probability).toBeNull();
      expect(mockGenerateContent).toHaveBeenCalledTimes(3);
      expect(mockErrorLog).toHaveBeenCalledWith(
        "Gemini analysis failed after retries - storing without analysis",
        tempError,
        expect.objectContaining({
          title: "Title",
          source: "Source",
        }),
      );
    });

    it("should not retry on quota errors", async () => {
      const quotaError = new Error("429 quota exceeded");
      mockGenerateContent.mockRejectedValueOnce(quotaError);

      const result = await analyzeRumorCredibility(
        "Title",
        "Description",
        "Source",
      );

      expect(mockGenerateContent).toHaveBeenCalledTimes(1); // No retries
      expect(result.isTransferRumor).toBeNull();
    });

    it("should handle empty description", async () => {
      const mockResponse = {
        text: '{"isTransferRumor": false, "probability": 0, "reasoning": "Test", "confidence": "low"}',
      };

      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      const result = await analyzeRumorCredibility("Title", "", "Source");

      expect(result).toBeDefined();
      expect(mockGenerateContent).toHaveBeenCalled();
    });

    it("should log business metrics on successful analysis", async () => {
      const mockResponse = {
        text: '{"isTransferRumor": true, "probability": 80, "reasoning": "Test", "confidence": "high"}',
      };

      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      await analyzeRumorCredibility("Title", "Description", "Source");

      expect(mockBusinessLog).toHaveBeenCalledWith("rumor_analyzed", {
        probability: 80,
        confidence: "high",
      });
    });

    it("should handle response with no text field", async () => {
      mockGenerateContent
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({})
        .mockResolvedValueOnce({});

      const result = await analyzeRumorCredibility(
        "Title",
        "Description",
        "Source",
      );
      // Should fail and retry, then return null
      expect(result.isTransferRumor).toBeNull();
    });

    it("should handle malformed JSON in response", async () => {
      mockGenerateContent.mockReset();
      mockGenerateContent
        .mockResolvedValueOnce({ text: "This is not JSON" })
        .mockResolvedValueOnce({ text: "Still not JSON" })
        .mockResolvedValueOnce({ text: "Nope" });

      const result = await analyzeRumorCredibility(
        "Title",
        "Description",
        "Source",
      );

      expect(result.isTransferRumor).toBeNull();
      expect(result.probability).toBeNull();
      expect(mockGenerateContent).toHaveBeenCalledTimes(3);
    });

    it("should use correct Gemini model", async () => {
      const mockResponse = {
        text: '{"isTransferRumor": false, "probability": 0, "reasoning": "Test", "confidence": "low"}',
      };

      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      await analyzeRumorCredibility("Title", "Description", "Source");

      expect(mockGenerateContent).toHaveBeenCalledWith({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
        contents: expect.any(String),
      });
    });

    it("should include title, description, and source in prompt", async () => {
      const mockResponse = {
        text: '{"isTransferRumor": false, "probability": 0, "reasoning": "Test", "confidence": "low"}',
      };

      mockGenerateContent.mockResolvedValueOnce(mockResponse);

      await analyzeRumorCredibility(
        "Test Title",
        "Test Description",
        "Test Source",
      );

      const callArg = mockGenerateContent.mock.calls[0][0];
      expect(callArg.contents).toContain("Test Title");
      expect(callArg.contents).toContain("Test Description");
      expect(callArg.contents).toContain("Test Source");
    });

    it("should handle missing GEMINI_API_KEY environment variable", async () => {
      delete process.env.GEMINI_API_KEY;

      await expect(
        analyzeRumorCredibility("Title", "Description", "Source"),
      ).rejects.toThrow("GEMINI_API_KEY environment variable is required");
    });

    it("should wait 1 second between retry attempts", async () => {
      const tempError = new Error("Temporary error");
      const successResponse = {
        text: '{"isTransferRumor": true, "probability": 50, "reasoning": "Test", "confidence": "medium"}',
      };

      mockGenerateContent
        .mockRejectedValueOnce(tempError)
        .mockResolvedValueOnce(successResponse);

      const startTime = Date.now();
      await analyzeRumorCredibility("Title", "Description", "Source");
      const duration = Date.now() - startTime;

      // Should wait ~1 second between attempts
      expect(duration).toBeGreaterThanOrEqual(900);
    }, 10000);

    it("should handle different confidence levels", async () => {
      const testCases = ["low", "medium", "high"];

      for (const confidence of testCases) {
        const mockResponse = {
          text: `{"isTransferRumor": true, "probability": 50, "reasoning": "Test", "confidence": "${confidence}"}`,
        };

        mockGenerateContent.mockResolvedValueOnce(mockResponse);

        const result = await analyzeRumorCredibility(
          "Title",
          "Description",
          "Source",
        );

        expect(result.confidence).toBe(confidence);
      }
    });

    it("should handle probability values from 0 to 100", async () => {
      const probabilities = [0, 25, 50, 75, 100];

      for (const prob of probabilities) {
        const mockResponse = {
          text: `{"isTransferRumor": true, "probability": ${prob}, "reasoning": "Test", "confidence": "medium"}`,
        };

        mockGenerateContent.mockResolvedValueOnce(mockResponse);

        const result = await analyzeRumorCredibility(
          "Title",
          "Description",
          "Source",
        );

        expect(result.probability).toBe(prob);
      }
    });
  });
});
