import js from "@eslint/js";
import vitest from "@vitest/eslint-plugin";
import prettier from "eslint-plugin-prettier";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["**/node_modules", "**/dist"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    name: "JavaScript and TypeScript",
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "simple-import-sort": simpleImportSort,
      prettier,
    },
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: "module",
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
      ...prettier.configs.recommended.rules,
      "@typescript-eslint/consistent-type-imports": [
        "error",
        {
          fixStyle: "separate-type-imports",
          disallowTypeAnnotations: false,
        },
      ],
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^e(rr(or)?)?$",
        },
      ],
    },
  },
  {
    name: "Vitest",
    files: ["**/*.test.*"],
    plugins: {
      vitest,
    },
    rules: {
      ...vitest.configs.recommended.rules,
    },
  },
  {
    name: "Domain boundaries",
    files: ["src/domain/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "react",
            "react-dom",
            "react-dom/*",
            "**/application/**",
            "**/infrastructure/**",
            "**/presentation/**",
          ],
        },
      ],
      "no-restricted-globals": ["error", "fetch"],
    },
  },
  {
    name: "Application boundaries",
    files: ["src/application/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "react",
            "react-dom",
            "react-dom/*",
            "**/infrastructure/**",
            "**/presentation/**",
          ],
        },
      ],
      "no-restricted-globals": ["error", "fetch"],
    },
  },
  {
    name: "Infrastructure boundaries",
    files: ["src/infrastructure/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "react",
            "react-dom",
            "react-dom/*",
            "**/application/**",
            "**/presentation/**",
          ],
        },
      ],
    },
  },
  {
    name: "Presentation boundaries",
    files: ["src/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: ["**/infrastructure/**"] },
      ],
      "no-restricted-globals": ["error", "fetch"],
    },
  },
];
