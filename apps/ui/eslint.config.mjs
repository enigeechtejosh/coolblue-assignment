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
    files: ["src/domains/*/domain/**/*.ts"],
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
            "@/app/**",
            "@/shared/**",
          ],
        },
      ],
      "no-restricted-globals": ["error", "fetch"],
    },
  },
  {
    name: "Application boundaries",
    files: ["src/domains/*/application/**/*.ts"],
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
            "@/app/**",
            "@/shared/**",
          ],
        },
      ],
      "no-restricted-globals": ["error", "fetch"],
    },
  },
  {
    name: "Infrastructure boundaries",
    files: ["src/domains/*/infrastructure/**/*.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "react",
            "react-dom",
            "react-dom/*",
            "**/application/use-cases/**",
            "**/presentation/**",
            "@/app/**",
            "@/shared/**",
          ],
        },
      ],
    },
  },
  {
    name: "Shared boundaries",
    files: ["src/shared/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: ["@/domains/**", "@/app/**"] },
      ],
    },
  },
  {
    name: "Presentation boundaries",
    files: ["src/domains/*/presentation/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: ["**/infrastructure/**", "@/app/**"] },
      ],
      "no-restricted-globals": ["error", "fetch"],
    },
  },
];
