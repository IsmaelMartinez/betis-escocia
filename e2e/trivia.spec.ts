import { test, expect } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';
import { mockFlagsmithAPI } from './helpers/flagsmith-mock';

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// Initialize Supabase client with service role key for cleanup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL must be set in .env.local');
}

if (!supabaseServiceRoleKey) {
  console.warn('Warning: NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY not found. Database cleanup will be skipped.');
  console.warn('To enable database cleanup, add NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY to your .env.local file.');
}

const supabaseAdmin = supabaseServiceRoleKey ? createClient(supabaseUrl, supabaseServiceRoleKey) : null;

// Assuming the test user ID is available as an environment variable
// IMPORTANT: Replace 'your_clerk_test_user_id' with the actual Clerk userId of your test user.
// You can find this in your Clerk dashboard under the test user's details.
const TEST_USER_ID = process.env.CLERK_TEST_USER_ID || 'your_clerk_test_user_id';

test.describe('Trivia Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock Flagsmith API to prevent excessive requests
    await mockFlagsmithAPI(page, {
      'trivia-game': true
    });

    // Mock the /api/trivia endpoint to return a consistent set of questions (GET)
    await page.route('/api/trivia', route => {
      if (route.request().method() === 'GET') {
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
      } else if (route.request().method() === 'POST') {
        // Handle POST requests for score submission
        route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'Score saved successfully!' }),
        });
      } else {
        route.continue();
      }
    });

    // Mock the /api/trivia/total-score-dashboard endpoint
    await page.route('/api/trivia/total-score-dashboard', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ totalScore: 10 }), // Example total score
      });
    });

    // Mock the /api/trivia/total-score endpoint
    await page.route('/api/trivia/total-score', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ score: 10 }), // Example total score
      });
    });

  });

  test.afterEach(async () => {
    // Clean up user_trivia_scores for the test user after each test
    if (!supabaseAdmin) {
      console.log('Skipping database cleanup - SUPABASE_SERVICE_ROLE_KEY not available');
      return;
    }

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

    // Check initial landing page elements
    await expect(page.locator('h1', { hasText: 'Betis & Scotland Trivia Challenge' })).toBeVisible();
    await expect(page.locator('text=¡Pon a prueba tus conocimientos sobre el Real Betis y Escocia!')).toBeVisible();
    await expect(page.locator('button', { hasText: 'Comenzar Trivia' })).toBeVisible();

    // Start the game
    await page.locator('button', { hasText: 'Comenzar Trivia' }).click();

    // Wait for game to load and check game elements
    await page.waitForSelector('h2', { timeout: 10000 });
    await expect(page.locator('h2')).toBeVisible();
    await expect(page.locator('p', { hasText: 'Pregunta 1 of' })).toBeVisible();
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
    
    // Start the game first
    await expect(page.locator('button', { hasText: 'Comenzar Trivia' })).toBeVisible();
    await page.locator('button', { hasText: 'Comenzar Trivia' }).click();
    
    // Wait for the game to start
    await page.waitForSelector('h2', { timeout: 10000 });
    await expect(page.locator('h2')).toBeVisible();

    // Answer first question correctly (assuming first button is correct for mock data)
    await page.locator('div.grid button').first().click();
    await expect(page.locator('text=Puntuación: 1')).toBeVisible();
    await expect(page.locator('p', { hasText: 'Pregunta 2 of' })).toBeVisible({ timeout: 5000 });

    // Answer second question correctly
    await page.locator('div.grid button').first().click();
    await expect(page.locator('text=Puntuación: 2')).toBeVisible();
    await expect(page.locator('p', { hasText: 'Pregunta 3 of' })).toBeVisible({ timeout: 5000 });

    // Answer third question correctly
    await page.locator('div.grid button').first().click();
    
    // Wait for game completion with longer timeout since there's processing time
    await expect(page.locator('h1', { hasText: '¡Trivia Diaria Completada!' })).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=3/3')).toBeVisible();
    await expect(page.locator('text=100% Correct')).toBeVisible();
    await expect(page.locator('text=Puntuación Total Trivia')).toBeVisible();
    await expect(page.locator('a', { hasText: 'Volver al Inicio' })).toBeVisible();
  });

  test('should display already played message if user has played today', async ({ page }) => {
    // First unroute any existing mocks, then add our specific one
    await page.unroute('/api/trivia');
    
    // Mock the /api/trivia endpoint to return 403 (already played)
    await page.route('/api/trivia', route => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 403,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'You have already played today.', score: 2 }),
        });
      } else {
        route.continue();
      }
    });

    const response = await page.goto('/trivia');
    expect(response?.status()).toBe(200); // Page itself still loads 200

    // Wait a bit for the API call to complete and UI to update
    await page.waitForTimeout(2000);

    await expect(page.locator('text=Trivia game is currently not enabled.')).not.toBeVisible(); // Ensure it's not the feature flag message
    
    // Check that the game completion screen is shown directly (since user already played)
    await expect(page.locator('h1', { hasText: '¡Trivia Diaria Completada!' })).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=2/5')).toBeVisible(); // Shows the score from mock (2)
    await expect(page.locator('text=Puntuación Total Trivia')).toBeVisible(); // Still shows total from mock
    await expect(page.locator('div.grid button')).not.toBeVisible(); // Game elements should not be visible
    await expect(page.locator('button', { hasText: 'Comenzar Trivia' })).not.toBeVisible(); // Start button should not be visible
  });
});

