import { defineConfig, devices } from '@playwright/test';
import { env } from './config/env';

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    testIdAttribute: 'data-test',
    actionTimeout: 10_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      // Logs each saucedemo user in once and saves storageState to .auth/<user>.json.
      name: 'setup',
      testDir: './tests/setup',
      testMatch: /.*\.setup\.ts/,
      use: { baseURL: env.sauce.baseUrl },
    },
    {
      name: 'ui',
      testDir: './tests/ui',
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], baseURL: env.sauce.baseUrl },
    },
    {
      // No browser and no login needed; API clients get their own request context (see src/fixtures).
      name: 'api',
      testDir: './tests/api',
    },
  ],
});
