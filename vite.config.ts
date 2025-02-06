import { defineConfig } from 'vitest/config';

// https://vitejs.dev/config/
export default defineConfig({
  test: {
    clearMocks: true,
    mockReset: true,
    restoreMocks: true,
    coverage: {
      provider: 'istanbul',
      reporter: ['html', 'lcov', 'text'],
    },
  },
});
