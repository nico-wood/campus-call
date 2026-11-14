import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts", "evals/**/*.eval.ts"],
    exclude: ["node_modules/**", "dist/**", "e2e/**"],
    testTimeout: 10_000,
    passWithNoTests: false,
    fileParallelism: false,
  },
});
