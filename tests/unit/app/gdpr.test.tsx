import { describe, it, expect, vi } from "vitest";
import { redirect } from "next/navigation";

// Mock Next.js navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

describe("GDPR Page", () => {
  it("should redirect to home page", async () => {
    const GDPRPage = (await import("@/app/gdpr/page")).default;

    // Call the page component
    GDPRPage();

    // Should redirect to home
    expect(redirect).toHaveBeenCalledWith("/");
  });
});
