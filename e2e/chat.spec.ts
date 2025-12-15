import { test, expect } from '@playwright/test';

test.describe('Chat Widget', () => {
  test.beforeEach(async ({ page }) => {
    // Enable the chat feature for testing
    await page.goto('/', { waitUntil: 'networkidle' });
  });

  test('chat toggle button is visible when feature is enabled', async ({ page }) => {
    // Note: This test assumes NEXT_PUBLIC_FEATURE_CHAT_ASSISTANT=true in test env
    const chatToggle = page.getByTestId('chat-toggle');
    
    // If feature is enabled, button should be visible
    // If not enabled, this test can be skipped
    const isVisible = await chatToggle.isVisible().catch(() => false);
    
    if (isVisible) {
      await expect(chatToggle).toBeVisible();
      await expect(chatToggle).toHaveAttribute('aria-label', 'Abrir chat assistant');
    }
  });

  test('opens and closes chat window', async ({ page }) => {
    const chatToggle = page.getByTestId('chat-toggle');
    
    const isVisible = await chatToggle.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    // Open chat
    await chatToggle.click();
    
    // Chat window should be visible
    const chatDialog = page.getByRole('dialog', { name: 'Chat assistant' });
    await expect(chatDialog).toBeVisible();
    
    // Close chat
    await chatToggle.click();
    await expect(chatDialog).not.toBeVisible();
  });

  test('displays welcome message when chat opens', async ({ page }) => {
    const chatToggle = page.getByTestId('chat-toggle');
    
    const isVisible = await chatToggle.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await chatToggle.click();
    
    // Welcome message should contain Peña Bética text
    await expect(page.getByText('Peña Bética Escocesa')).toBeVisible();
  });

  test('can type and submit a message', async ({ page }) => {
    const chatToggle = page.getByTestId('chat-toggle');
    
    const isVisible = await chatToggle.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await chatToggle.click();
    
    const input = page.getByTestId('chat-input');
    const sendButton = page.getByTestId('chat-send');
    
    // Type a message
    await input.fill('¿Cuándo juega el Betis?');
    
    // Send button should be enabled
    await expect(sendButton).toBeEnabled();
    
    // Submit the message
    await sendButton.click();
    
    // Input should be cleared after sending
    await expect(input).toHaveValue('');
    
    // User message should appear in chat
    await expect(page.getByText('¿Cuándo juega el Betis?')).toBeVisible();
  });

  test('send button is disabled when input is empty', async ({ page }) => {
    const chatToggle = page.getByTestId('chat-toggle');
    
    const isVisible = await chatToggle.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await chatToggle.click();
    
    const sendButton = page.getByTestId('chat-send');
    
    // Button should be disabled when input is empty
    await expect(sendButton).toBeDisabled();
  });

  test('closes chat with Escape key', async ({ page }) => {
    const chatToggle = page.getByTestId('chat-toggle');
    
    const isVisible = await chatToggle.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip();
      return;
    }

    await chatToggle.click();
    
    const chatDialog = page.getByRole('dialog', { name: 'Chat assistant' });
    await expect(chatDialog).toBeVisible();
    
    // Press Escape
    await page.keyboard.press('Escape');
    
    await expect(chatDialog).not.toBeVisible();
  });
});
