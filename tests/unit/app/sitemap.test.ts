import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import sitemap from "../../../src/app/sitemap";

const BASE_URL = "https://betis-escocia.vercel.app";

describe("sitemap", () => {
  const mockDate = new Date("2025-01-01T12:00:00.000Z");

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("emits the home page with weekly cadence and priority 1", () => {
    const home = sitemap().find((page) => page.url === BASE_URL);
    expect(home).toEqual({
      url: BASE_URL,
      lastModified: mockDate,
      changeFrequency: "weekly",
      priority: 1,
    });
  });

  it("emits /partidos with daily cadence and priority 0.9", () => {
    const partidos = sitemap().find(
      (page) => page.url === `${BASE_URL}/partidos`,
    );
    expect(partidos).toEqual({
      url: `${BASE_URL}/partidos`,
      lastModified: mockDate,
      changeFrequency: "daily",
      priority: 0.9,
    });
  });

  it("emits every public route exactly once", () => {
    const urls = sitemap().map((p) => p.url);
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls).toEqual(
      expect.arrayContaining([
        BASE_URL,
        `${BASE_URL}/partidos`,
        `${BASE_URL}/clasificacion`,
        `${BASE_URL}/nosotros`,
        `${BASE_URL}/unete`,
        `${BASE_URL}/jugadores-historicos`,
        `${BASE_URL}/joaquin`,
      ]),
    );
  });

  it("gives /unete a higher priority than the other monthly pages", () => {
    const pages = sitemap();
    const unete = pages.find((p) => p.url === `${BASE_URL}/unete`);
    const nosotros = pages.find((p) => p.url === `${BASE_URL}/nosotros`);
    expect(unete?.priority).toBe(0.9);
    expect(nosotros?.priority).toBe(0.8);
  });
});
