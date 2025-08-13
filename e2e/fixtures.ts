/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import { mockFlagsmithAPI } from './helpers/flagsmith-mock';

// Extend base test to always mock Flagsmith before each test
export const test = base.extend({
  page: async ({ page }, use) => {
    await mockFlagsmithAPI(page);
    await use(page);
  }
});

export const expect = test.expect;
