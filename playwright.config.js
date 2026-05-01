import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://127.0.0.1:4173",
    headless: true,
    channel: "chrome"
  },
  webServer: {
    command: "npm run build:client && node server.js",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: false,
    timeout: 120000
  }
});
