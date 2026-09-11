import { defineConfig, devices } from '@playwright/test';
const production = process.env.WOBBI_PRODUCTION === '1';
const baseURL = production ? 'http://127.0.0.1:4173' : 'http://127.0.0.1:5173';
export default defineConfig({
  testDir: './tests',
  testMatch: ['e2e/**/*.spec.js', 'visual/**/*.spec.js'],
  fullyParallel: true,
  workers: 2,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 30000,
  expect: {
    timeout: 5000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.002, animations: 'disabled' },
  },
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 900 },
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: production
      ? 'npm run preview -- --port 4173 --strictPort'
      : 'npm run dev -- --port 5173 --strictPort',
    url: baseURL,
    reuseExistingServer: !process.env.CI && !production,
    timeout: 30000,
  },
});
