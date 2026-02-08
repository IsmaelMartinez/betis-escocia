import sitemap from "../../../src/app/sitemap";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getEnabledNavigationItems, hasFeature } from "@/lib/features/featureFlags";

// Mock the featureFlags module
vi.mock("@/lib/features/featureFlags", () => ({
  getEnabledNavigationItems: vi.fn(),
  hasFeature: vi.fn(),
}));

describe("sitemap", () => {
  const baseUrl = "https://betis-escocia.vercel.app";
  const mockDate = new Date("2025-01-01T12:00:00.000Z");

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Date to ensure consistent lastModified values
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
    // Default: show-partidos is enabled
    vi.mocked(hasFeature).mockReturnValue(true);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should generate sitemap with only static pages when no dynamic navigation items are enabled", () => {
    vi.mocked(getEnabledNavigationItems).mockReturnValue([]);

    const result = sitemap();

    expect(result).toEqual([
      {
        url: baseUrl,
        lastModified: mockDate,
        changeFrequency: "weekly",
        priority: 1,
      },
      {
        url: `${baseUrl}/partidos`,
        lastModified: mockDate,
        changeFrequency: "daily",
        priority: 0.9,
      },
    ]);
  });

  it("should generate sitemap with dynamic pages when navigation items are enabled", () => {
    vi.mocked(getEnabledNavigationItems).mockReturnValue([
      { href: "/", name: "Home", nameEn: "Home", feature: null }, // Should be filtered out as it's a static page
      { href: "/unete", name: "Únete", nameEn: "Join Us", feature: null },
      { href: "/contacto", name: "Contacto", nameEn: "Contact", feature: null },
    ]);

    const result = sitemap();

    expect(result).toEqual(
      expect.arrayContaining([
        {
          url: baseUrl,
          lastModified: mockDate,
          changeFrequency: "weekly",
          priority: 1,
        },
        {
          url: `${baseUrl}/partidos`,
          lastModified: mockDate,
          changeFrequency: "daily",
          priority: 0.9,
        },
        {
          url: `${baseUrl}/unete`,
          lastModified: mockDate,
          changeFrequency: "monthly",
          priority: 0.9,
        },
        {
          url: `${baseUrl}/contacto`,
          lastModified: mockDate,
          changeFrequency: "monthly",
          priority: 0.9,
        },
      ]),
    );
    expect(result.length).toBe(4); // Static + partidos + 2 dynamic
  });

  it("should handle different priorities for dynamic pages", () => {
    vi.mocked(getEnabledNavigationItems).mockReturnValue([
      { href: "/unete", name: "Únete", nameEn: "Join Us", feature: null },
      {
        href: "/contacto",
        name: "Contacto",
        nameEn: "Contact",
        feature: "show-contacto",
      },
    ]);

    const result = sitemap();

    const unetePage = result.find((page) => page.url === `${baseUrl}/unete`);
    const contactoPage = result.find(
      (page) => page.url === `${baseUrl}/contacto`,
    );

    expect(unetePage?.priority).toBe(0.9);
    expect(contactoPage?.priority).toBe(0.9);
  });

  it("should exclude /partidos from sitemap when show-partidos feature is disabled", () => {
    vi.mocked(getEnabledNavigationItems).mockReturnValue([]);
    vi.mocked(hasFeature).mockReturnValue(false);

    const result = sitemap();

    expect(result).toEqual([
      {
        url: baseUrl,
        lastModified: mockDate,
        changeFrequency: "weekly",
        priority: 1,
      },
    ]);
    expect(
      result.find((page) => page.url.includes("/partidos")),
    ).toBeUndefined();
  });
});
