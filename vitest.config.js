import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.js"],
    exclude: ["tests/e2e/**"],
    coverage: {
      include: ["src/**/*.js"],
      thresholds: {
        lines: 80,
        functions: 80,
        statements: 80
      }
    }
  }
});
