import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for cleanup
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

// Assuming the test user ID is available as an environment variable
// IMPORTANT: Replace 'your_clerk_test_user_id' with the actual Clerk userId of your test user.
// You can find this in your Clerk dashboard under the test user's details.
const TEST_USER_ID = process.env.CLERK_TEST_USER_ID || 'your_clerk_test_user_id';

test.describe('Trivia Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the /api/trivia endpoint to return a consistent set of questions
    await page.route('/api/trivia', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'q1',
            question_text: '¿Cuál es el estadio del Real Betis?',
            category: 'betis',
            difficulty: 'easy',
            trivia_answers: [
              { id: 'a1', answer_text: 'Benito Villamarín', is_correct: true },
              { id: 'a2', answer_text: 'Ramón Sánchez-Pizjuán', is_correct: false },
              { id: 'a3', answer_text: 'Camp Nou', is_correct: false },
              { id: 'a4', answer_text: 'Santiago Bernabéu', is_correct: false },
            ],
          },
          {
            id: 'q2',
            question_text: '¿Qué río atraviesa Glasgow?',
            category: 'scotland',
            difficulty: 'medium',
            trivia_answers: [
              { id: 'b1', answer_text: 'Clyde', is_correct: true },
              { id: 'b2', answer_text: 'Támesis', is_correct: false },
              { id: 'b3', answer_text: 'Sena', is_correct: false },
              { id: 'b4', answer_text: 'Danubio', is_correct: false },
            ],
          },
          {
            id: 'q3',
            question_text: '¿En qué año se fundó el Real Betis Balompié?',
            category: 'betis',
            difficulty: 'hard',
            trivia_answers: [
              { id: 'c1', answer_text: '1907', is_correct: true },
              { id: 'c2', answer_text: '1900', is_correct: false },
              { id: 'c3', answer_text: '1910', is_correct: false },
              { id: 'c4', answer_text: '1914', is_correct: false },
            ],
          },
        ]),
      });

    // Mock the /api/trivia/total-score-dashboard endpoint
    await page.route('/api/trivia/total-score-dashboard', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ totalScore: 10 }), // Example total score
      });
    });
  });

  test.afterEach(async () => {
    // Clean up user_trivia_scores for the test user after each test
    console.log(`Cleaning up trivia scores for user: ${TEST_USER_ID}`);
    const { error } = await supabaseAdmin
      .from('user_trivia_scores')
      .delete()
      .eq('user_id', TEST_USER_ID);

    if (error) {
      console.error('Error cleaning up trivia scores:', error);
    } else {
      console.log(`Cleaned up trivia scores for user: ${TEST_USER_ID}`);
    }
  });

  test('should load successfully and display key elements', async ({ page }) => {
    const response = await page.goto('/trivia');
    expect(response?.status()).toBe(200);

    await page.waitForSelector('h1:has-text("Betis & Scotland Trivia Challenge")');
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('h1', { hasText: 'Betis & Scotland Trivia Challenge' })).toBeVisible();
    await expect(page.locator('p', { hasText: 'Pregunta 1 of' })).toBeVisible();
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('div.grid button')).toHaveCount(4);
    await expect(page.locator('text=Puntuación: 0')).toBeVisible(); // Initial score

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

  test('should allow user to answer questions and progress through the game, updating score', async ({ page }) => {
    await page.goto('/trivia');
    await expect(page.locator('h2')).toBeVisible();

    // Answer first question correctly (assuming first button is correct for mock data)
    await page.locator('div.grid button').first().click();
    await expect(page.locator('text=Puntuación: 1')).toBeVisible();
    await expect(page.locator('p', { hasText: 'Pregunta 2 of' })).toBeVisible({ timeout: 3000 });

    // Answer second question correctly
    await page.locator('div.grid button').first().click();
    await expect(page.locator('text=Puntuación: 2')).toBeVisible();
    await expect(page.locator('p', { hasText: 'Pregunta 3 of' })).toBeVisible({ timeout: 3000 });

    // Answer third question correctly
    await page.locator('div.grid button').first().click();
    await expect(page.locator('text=Puntuación: 3')).toBeVisible();

    // After the last question, expect to see the results
    await expect(page.locator('h1', { hasText: '¡Trivia Diaria Completada!' })).toBeVisible();
    await expect(page.locator('text=3/3 Correct')).toBeVisible();
    await expect(page.locator('text=Puntuación Total Acumulada: 10')).toBeVisible();
    await expect(page.locator('a', { hasText: 'Volver al Inicio' })).toBeVisible();
  });

  test('should display already played message if user has played today', async ({ page }) => {
    // Mock the /api/trivia endpoint to return 403 (already played)
    await page.route('/api/trivia', route => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'You have already played today.', score: 2 }),
      });
    });

    const response = await page.goto('/trivia');
    expect(response?.status()).toBe(200); // Page itself still loads 200

    await expect(page.locator('text=Trivia game is currently not enabled.')).not.toBeVisible(); // Ensure it's not the feature flag message
    await expect(page.locator('text=You have already played today. Your score: 2')).toBeVisible();
    await expect(page.locator('h1', { hasText: '¡Trivia Diaria Completada!' })).toBeVisible();
    await expect(page.locator('text=Puntuación Total Acumulada: 10')).toBeVisible(); // Still shows total from mock
    await expect(page.locator('div.grid button')).not.toBeVisible(); // Game elements should not be visible
  });
}