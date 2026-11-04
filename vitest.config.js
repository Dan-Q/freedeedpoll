import { defineConfig } from 'vitest/config'

// Only unit tests; the Playwright specs in e2e/ are run separately (npm run test:e2e)
export default defineConfig({
  test: { include: ['test/**/*.test.js'] },
});
