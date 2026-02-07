import { test, expect } from "./fixtures";

test.describe("Joaquín Page Happy Path", () => {
  test("should load successfully and display key elements", async ({
    page,
  }) => {
    const consoleListener = (msg: any) => {
      if (msg.type() === "error") {
        console.error(`Console error: ${msg.text()}`);
        expect(msg.type()).not.toBe("error");
      }
    };

    const requestFailedListener = (request: any) => {
      console.error(
        `Network request failed: ${request.url()} - ${request.failure()?.errorText}`,
      );
      expect(request.failure()).toBeNull();
    };

    page.on("console", consoleListener);
    page.on("requestfailed", requestFailedListener);

    try {
      const response = await page.goto("/joaquin");
      expect(response?.status()).toBe(200);

      await expect(
        page.locator("h1", { hasText: "Los Chistes de Joaquín" }),
      ).toBeVisible();
      await expect(
        page.getByText("El hombre que convirtió el fútbol en comedia"),
      ).toBeVisible();
      await expect(page.getByText("Momentos Memorables")).toBeVisible();
    } finally {
      page.off("console", consoleListener);
      page.off("requestfailed", requestFailedListener);
    }
  });

  test("should render all six moment cards", async ({ page }) => {
    await page.goto("/joaquin");

    await expect(page.getByText("El Rey del Confinamiento")).toBeVisible();
    await expect(page.getByText("El Hormiguero")).toBeVisible();
    await expect(page.getByText("Los Cumpleaños del Vestuario")).toBeVisible();
    await expect(page.getByText("Ruedas de Prensa Memorables")).toBeVisible();
    await expect(page.getByText("Campeón con Cachondeo")).toBeVisible();
    await expect(page.getByText("La Despedida de la Leyenda")).toBeVisible();
  });

  test("should have external video links with correct attributes", async ({
    page,
  }) => {
    await page.goto("/joaquin");

    const videoLinks = page.getByRole("link", { name: /Ver Vídeos/ });
    await expect(videoLinks).toHaveCount(6);

    for (const link of await videoLinks.all()) {
      await expect(link).toHaveAttribute("href", /youtube\.com\/results/);
      await expect(link).toHaveAttribute("target", "_blank");
      await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  test("should render CTA section with navigation links", async ({ page }) => {
    await page.goto("/joaquin");

    await expect(page.getByText("¡Viva er Betis manque pierda!")).toBeVisible();

    const youtubeLink = page.getByRole("link", {
      name: /Más Vídeos en YouTube/,
    });
    await expect(youtubeLink).toHaveAttribute("href", /youtube\.com/);
    await expect(youtubeLink).toHaveAttribute("target", "_blank");

    const nosotrosLink = page.getByRole("link", { name: /Nuestra Historia/ });
    await expect(nosotrosLink).toHaveAttribute("href", "/nosotros");
  });

  test("should navigate back to home page", async ({ page }) => {
    await page.goto("/joaquin");

    await page.locator('header a[href="/"]').click();
    await expect(page).toHaveURL("/");
  });
});
