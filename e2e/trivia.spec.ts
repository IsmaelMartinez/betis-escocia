import { test, expect } from '@playwright/test';

test.describe('Trivia Page Happy Path', () => {
  test('should load successfully and display key elements', async ({ page }) => {
    // Verify page loads successfully (HTTP 200)
    const response = await page.goto('/trivia');
    expect(response?.status()).toBe(200);

    // Wait for the main trivia heading to be visible, indicating content has loaded
    await page.waitForSelector('h1:has-text("Betis & Scotland Trivia Challenge")');

    // Wait for the question text to be visible, indicating questions have loaded
    await expect(page.locator('h2')).toBeVisible();

    // Assert visibility of key elements
    await expect(page.locator('h1', { hasText: 'Betis & Scotland Trivia Challenge' })).toBeVisible();
    await expect(page.locator('p', { hasText: 'Pregunta 1 of' })).toBeVisible();
    await expect(page.locator('h2')).toBeVisible(); // Question text
    await expect(page.locator('div.grid button')).toHaveCount(4); // Four answer buttons within the grid
    await expect(page.locator('text=Puntuación:')).toBeVisible();

    // Ensure no console errors or network failures on page load
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`Console error: ${msg.text()}`);
        expect(msg.type()).not.toBe('error');
      }
    });
    page.on('requestfailed', request => {
      console.error(`Network request failed: ${request.url()} - ${request.failure()?.errorText}`);
      expect(request.failure()).toBeNull();
    });
  });

  test('should allow user to answer questions and progress through the game', async ({ page }) => {
    await page.goto('/trivia');

    // Wait for questions to load
    await expect(page.locator('h2')).toBeVisible();

    // Answer the first question
    await page.locator('div.grid button').first().click();

    // Expect to move to the next question after a delay (2 seconds feedback + transition)
    await expect(page.locator('p', { hasText: 'Pregunta 2 of' })).toBeVisible({ timeout: 3000 });

    // Continue answering questions until the end of the game (3 questions total)
    for (let i = 2; i <= 3; i++) {
      await page.locator('div.grid button').first().click();
      if (i < 3) {
        await expect(page.locator('p', { hasText: `Pregunta ${i + 1} of` })).toBeVisible({ timeout: 3000 });
      }
    }

    // After the last question, expect to see the "¡Trivia Diaria Completada!" message
    await expect(page.locator('h1', { hasText: '¡Trivia Diaria Completada!' })).toBeVisible();
    await expect(page.locator('text=Puntuación Total Acumulada:')).toBeVisible();
    await expect(page.locator('a', { hasText: 'Volver al Inicio' })).toBeVisible();
  });
});
