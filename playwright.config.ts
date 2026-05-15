import { defineConfig, devices } from "@playwright/test";

require("dotenv").config({ path: ".env.local" });

const OPTIONAL_ENV_VARS = ["FOOTBALL_DATA_API_KEY"] as const;

function buildWebServerEnv(): Record<string, string> {
  const env: Record<string, string> = {};
  OPTIONAL_ENV_VARS.forEach((varName) => {
    env[varName] = process.env[varName] || "";
  });
  return env;
}

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
    env: buildWebServerEnv(),
  },
});
