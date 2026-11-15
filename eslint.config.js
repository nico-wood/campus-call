import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "coverage/**",
      "logs/**",
      "test-results/**",
      "playwright-report/**",
      "blob-report/**",
      "research/**",
      ".next/**",
      "next-env.d.ts",
      "out/**",
      ".claude/worktrees/**",
      ".ui-autoresearch/**",
    ],
  },
  {
    files: ["**/*.{js,cjs,mjs,ts,tsx}"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      globals: {
        require: "readonly",
        process: "readonly",
        module: "readonly",
        __dirname: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
);
