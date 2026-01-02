import { test, expect } from "./fixtures";

// TODO: Re-enable these tests when NEXT_PUBLIC_FEATURE_PARTIDOS is enabled in CI environment
// These tests require the partidos feature flag to be enabled
test.describe.skip("Partidos Page Happy Path", () => {
  test("should load successfully and display key elements", async ({
    page,
  }) => {
    // 2.4.1 Verify page loads successfully (HTTP 200)
    const response = await page.goto("/partidos");
    expect(response?.status()).toBe(200);

    // 2.4.2 Assert visibility of key elements
    await expect(
      page.locator("h1", { hasText: "Partidos" }),
    ).toBeVisible();
    await expect(
      page.getByText("Todos los partidos en el Polwarth Tavern"),
    ).toBeVisible();

    // 2.4.4 Ensure no console errors or network failures on page load
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.error(`Console error: ${msg.text()}`);
        expect(msg.type()).not.toBe("error");
      }
    });
    page.on("requestfailed", (request) => {
      console.error(
        `Network request failed: ${request.url()} - ${request.failure()?.errorText}`,
      );
      expect(request.failure()).toBeNull();
    });
  });

  test("should navigate back to home page", async ({ page }) => {
    await page.goto("/partidos");

    // 2.4.3 Verify basic navigation
    await page.locator('header a[href="/"]').click();
    await expect(page).toHaveURL("/");
  });
});
