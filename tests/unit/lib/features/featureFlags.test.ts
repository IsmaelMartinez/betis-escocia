import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  hasFeature,
  getEnabledNavigationItems,
  getFeatureFlagsStatus,
  clearFeatureCache,
} from "@/lib/features/featureFlags";

// Mock environment variables
const mockEnv: Record<string, string | undefined> = {};

// Mock process.env properly
vi.stubGlobal("process", {
  env: mockEnv,
});

describe("Feature Flags - Simplified System", () => {
  beforeEach(() => {
    // Reset environment variables
    Object.keys(mockEnv).forEach((key) => delete mockEnv[key]);

    // Clear feature cache
    clearFeatureCache();
  });

  describe("Default Feature Values", () => {
    it("should return default values when no environment variables are set", () => {
      // Enabled by default (core features)
      expect(hasFeature("show-nosotros")).toBe(true);
      expect(hasFeature("show-jugadores-historicos")).toBe(true);
      expect(hasFeature("show-unete")).toBe(true);
      expect(hasFeature("show-clasificacion")).toBe(true);

      // Disabled by default (Phase 2 or optional features)
      expect(hasFeature("show-rsvp")).toBe(false);
      expect(hasFeature("show-contacto")).toBe(false);
      expect(hasFeature("show-partidos")).toBe(true);
      expect(hasFeature("show-clerk-auth")).toBe(false);
      expect(hasFeature("show-debug-info")).toBe(false);
    });
  });

  describe("Environment Variable Overrides", () => {
    it('should override defaults when environment variables are set to "true"', () => {
      mockEnv.NEXT_PUBLIC_FEATURE_RSVP = "true";
      mockEnv.NEXT_PUBLIC_FEATURE_DEBUG_INFO = "true";
      clearFeatureCache();

      expect(hasFeature("show-rsvp")).toBe(true);
      expect(hasFeature("show-debug-info")).toBe(true);
    });

    it('should override defaults when environment variables are set to "false"', () => {
      mockEnv.NEXT_PUBLIC_FEATURE_RSVP = "false";
      mockEnv.NEXT_PUBLIC_FEATURE_CLASIFICACION = "false";
      clearFeatureCache();

      expect(hasFeature("show-rsvp")).toBe(false);
      expect(hasFeature("show-clasificacion")).toBe(false);
    });

    it("should be case insensitive for environment variables", () => {
      mockEnv.NEXT_PUBLIC_FEATURE_CONTACTO = "TRUE";
      mockEnv.NEXT_PUBLIC_FEATURE_DEBUG_INFO = "True";
      clearFeatureCache();

      expect(hasFeature("show-contacto")).toBe(true);
      expect(hasFeature("show-debug-info")).toBe(true);
    });

    it('should default to false for any non-"true" value', () => {
      mockEnv.NEXT_PUBLIC_FEATURE_RSVP = "yes";
      mockEnv.NEXT_PUBLIC_FEATURE_CLASIFICACION = "1";
      mockEnv.NEXT_PUBLIC_FEATURE_PARTIDOS = "enabled";
      clearFeatureCache();

      expect(hasFeature("show-rsvp")).toBe(false);
      expect(hasFeature("show-clasificacion")).toBe(false);
      expect(hasFeature("show-partidos")).toBe(false);
    });
  });

  describe("Navigation Items", () => {
    it("should return only enabled navigation items", () => {
      const enabledItems = getEnabledNavigationItems();

      // Should include items that are enabled by default
      expect(enabledItems.some((item) => item.name === "Nosotros")).toBe(true);
      expect(enabledItems.some((item) => item.name === "Leyendas")).toBe(true);
      expect(enabledItems.some((item) => item.name === "Únete")).toBe(true);
      expect(enabledItems.some((item) => item.name === "Clasificación")).toBe(
        true,
      );

      // Should include Partidos (now enabled by default)
      expect(enabledItems.some((item) => item.name === "Partidos")).toBe(true);

      // Should NOT include Phase 2 items (disabled by default)
      expect(enabledItems.some((item) => item.name === "RSVP")).toBe(false);
      expect(enabledItems.some((item) => item.name === "Contacto")).toBe(false);
    });

    it("should include items when enabled via environment variables", () => {
      mockEnv.NEXT_PUBLIC_FEATURE_CONTACTO = "true";
      clearFeatureCache();

      const enabledItems = getEnabledNavigationItems();

      expect(enabledItems.some((item) => item.name === "Contacto")).toBe(true);
    });

    it("should exclude items when disabled via environment variables", () => {
      mockEnv.NEXT_PUBLIC_FEATURE_RSVP = "false";
      mockEnv.NEXT_PUBLIC_FEATURE_PARTIDOS = "false";
      clearFeatureCache();

      const enabledItems = getEnabledNavigationItems();

      expect(enabledItems.some((item) => item.name === "RSVP")).toBe(false);
      expect(enabledItems.some((item) => item.name === "Partidos")).toBe(false);
    });
  });

  describe("Feature Flags Status Debug", () => {
    it("should return null when debug mode is disabled", () => {
      mockEnv.NEXT_PUBLIC_FEATURE_DEBUG_INFO = "false";
      clearFeatureCache();
      const status = getFeatureFlagsStatus();
      expect(status).toBeNull();
    });

    it("should return debug info when debug mode is enabled", () => {
      mockEnv.NEXT_PUBLIC_FEATURE_DEBUG_INFO = "true";
      clearFeatureCache();

      const status = getFeatureFlagsStatus();

      expect(status).not.toBeNull();
      expect(status).toHaveProperty("features");
      expect(status).toHaveProperty("environment");
      expect(status).toHaveProperty("enabledFeatures");
      expect(status).toHaveProperty("disabledFeatures");

      expect(Array.isArray(status!.enabledFeatures)).toBe(true);
      expect(Array.isArray(status!.disabledFeatures)).toBe(true);
      expect(status!.enabledFeatures.includes("show-debug-info")).toBe(true);
    });
  });

  describe("Cache Management", () => {
    it("should cache feature flag results", () => {
      // First call resolves and caches (RSVP is now false by default)
      expect(hasFeature("show-rsvp")).toBe(false);

      // Change environment variable after first call
      mockEnv.NEXT_PUBLIC_FEATURE_RSVP = "true";

      // Should still return cached result
      expect(hasFeature("show-rsvp")).toBe(false);
    });

    it("should clear cache and re-evaluate after clearFeatureCache", () => {
      expect(hasFeature("show-rsvp")).toBe(false);

      mockEnv.NEXT_PUBLIC_FEATURE_RSVP = "true"; // Set to true to test cache clearing
      clearFeatureCache();

      expect(hasFeature("show-rsvp")).toBe(true); // Should now be true after cache clear
    });
  });
});
