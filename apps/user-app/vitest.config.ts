import { defineConfig, coverageConfigDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      thresholds: { lines: 80, functions: 80 },
      exclude: [
        ...coverageConfigDefaults.exclude,
        "src/main.tsx",
        "src/legacy-template/**",
        "playwright.config.ts",
      ],
    },
  },
});
