import { describe, it, expect } from "vitest";
import {
  getEfemeridesForDate,
  getCategoryEmoji,
  getCategoryLabel,
  EFEMERIDES,
  EFEMERIDES_FALLBACKS,
} from "@/data/efemerides";

describe("efemerides data", () => {
  describe("EFEMERIDES data structure", () => {
    it("has entries indexed by MM-DD format", () => {
      const keys = Object.keys(EFEMERIDES);
      expect(keys.length).toBeGreaterThan(0);

      keys.forEach((key) => {
        expect(key).toMatch(/^\d{2}-\d{2}$/);
      });
    });

    it("each entry has required fields", () => {
      Object.values(EFEMERIDES).forEach((events) => {
        events.forEach((event) => {
          expect(event).toHaveProperty("year");
          expect(event).toHaveProperty("title");
          expect(event).toHaveProperty("description");
          expect(event).toHaveProperty("category");
          expect(typeof event.year).toBe("number");
          expect(typeof event.title).toBe("string");
          expect(typeof event.description).toBe("string");
          expect(event.title.length).toBeGreaterThan(0);
          expect(event.description.length).toBeGreaterThan(0);
        });
      });
    });

    it("uses valid category values", () => {
      const validCategories = [
        "titulo",
        "gol",
        "fichaje",
        "fundacion",
        "anecdota",
        "europa",
        "escocia",
      ];

      Object.values(EFEMERIDES).forEach((events) => {
        events.forEach((event) => {
          expect(validCategories).toContain(event.category);
        });
      });
    });
  });

  describe("EFEMERIDES_FALLBACKS", () => {
    it("has at least one fallback", () => {
      expect(EFEMERIDES_FALLBACKS.length).toBeGreaterThan(0);
    });

    it("has one fallback per month", () => {
      expect(EFEMERIDES_FALLBACKS.length).toBe(12);
    });

    it("fallbacks have year 0", () => {
      EFEMERIDES_FALLBACKS.forEach((fallback) => {
        expect(fallback.year).toBe(0);
      });
    });

    it("fallbacks are Scotland-themed", () => {
      EFEMERIDES_FALLBACKS.forEach((fallback) => {
        expect(fallback.category).toBe("escocia");
      });
    });
  });

  describe("getEfemeridesForDate", () => {
    it("returns events for a date with data (March 17 - Liga title)", () => {
      const date = new Date(2024, 2, 17); // March 17
      const result = getEfemeridesForDate(date);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].year).toBe(1935);
      expect(result[0].category).toBe("titulo");
    });

    it("returns events for May 28 (Copa del Rey 2005)", () => {
      const date = new Date(2024, 4, 28); // May 28
      const result = getEfemeridesForDate(date);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].title).toContain("Copa del Rey");
    });

    it("returns a monthly Scotland fallback for a date without data", () => {
      const date = new Date(2024, 0, 5); // January 5 - no specific efeméride
      const result = getEfemeridesForDate(date);

      expect(result.length).toBe(1);
      expect(result[0].year).toBe(0);
      expect(result[0].category).toBe("escocia");
    });

    it("returns the correct monthly fallback for the given month", () => {
      const janDate = new Date(2024, 0, 5); // January
      const augDate = new Date(2024, 7, 20); // August

      const janResult = getEfemeridesForDate(janDate);
      const augResult = getEfemeridesForDate(augDate);

      expect(janResult[0].title).toContain("Enero");
      expect(augResult[0].title).toContain("Agosto");
    });

    it("returns Scotland events for Scotland-specific dates", () => {
      const date = new Date(2024, 0, 25); // January 25 - Burns Night
      const result = getEfemeridesForDate(date);

      expect(result.length).toBeGreaterThan(0);
      expect(result[0].category).toBe("escocia");
      expect(result[0].title).toContain("Robert Burns");
    });
  });

  describe("getCategoryEmoji", () => {
    it("returns trophy for titulo", () => {
      expect(getCategoryEmoji("titulo")).toBe("🏆");
    });

    it("returns football for gol", () => {
      expect(getCategoryEmoji("gol")).toBe("⚽");
    });

    it("returns pen for fichaje", () => {
      expect(getCategoryEmoji("fichaje")).toBe("✍️");
    });

    it("returns building for fundacion", () => {
      expect(getCategoryEmoji("fundacion")).toBe("🏛️");
    });

    it("returns book for anecdota", () => {
      expect(getCategoryEmoji("anecdota")).toBe("📖");
    });

    it("returns globe for europa", () => {
      expect(getCategoryEmoji("europa")).toBe("🌍");
    });

    it("returns Scotland flag for escocia", () => {
      expect(getCategoryEmoji("escocia")).toBe("🏴󠁧󠁢󠁳󠁣󠁴󠁿");
    });
  });

  describe("getCategoryLabel", () => {
    it("returns correct labels for all categories", () => {
      expect(getCategoryLabel("titulo")).toBe("Título");
      expect(getCategoryLabel("gol")).toBe("Golazo");
      expect(getCategoryLabel("fichaje")).toBe("Fichaje");
      expect(getCategoryLabel("fundacion")).toBe("Fundación");
      expect(getCategoryLabel("anecdota")).toBe("Bético");
      expect(getCategoryLabel("europa")).toBe("Europa");
      expect(getCategoryLabel("escocia")).toBe("Escocia");
    });
  });
});
