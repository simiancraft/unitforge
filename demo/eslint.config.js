// ESLint flat config for the unitforge demo (Vite + React 18 + react-compiler).
// The library in ../src has no React code, so ESLint runs only here. Biome
// owns formatting and most lint rules across the repo; this file exists for
// the two things Biome can't do today:
//   1. eslint-plugin-react-compiler surfaces compiler bailouts.
//   2. eslint-plugin-react-hooks supplies `rules-of-hooks`, which is
//      Biome's `useHookAtTopLevel` (in `nursery`, not recommended-by-default).
//
// We register react-hooks explicitly and enable only `rules-of-hooks`.
// Biome owns `useExhaustiveDependencies`, so the eslint twin is off; we
// don't inherit react-hooks' `recommended-latest` preset because it
// double-loads compiler-style rules that overlap with eslint-plugin-
// react-compiler.
import tsParser from '@typescript-eslint/parser';
import { defineConfig } from 'eslint/config';
import reactCompiler from 'eslint-plugin-react-compiler';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  reactCompiler.configs.recommended,
  {
    name: 'unitforge-demo',
    files: ['**/*.{js,jsx,ts,tsx}'],
    ignores: ['dist/**', 'node_modules/**'],
    // Parse TS/TSX with the typescript-eslint parser. We intentionally do NOT
    // pull in @typescript-eslint/eslint-plugin or its rule set; Biome owns
    // TypeScript linting in this repo.
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      // Surface all bailout severities, not just InvalidReact / InvalidJS.
      'react-compiler/react-compiler': [
        'error',
        {
          reportableLevels: new Set([
            'InvalidReact',
            'InvalidJS',
            'Todo',
            'CannotPreserveMemoization',
          ]),
        },
      ],
      'react-hooks/rules-of-hooks': 'error',
      // Biome's `correctness/useExhaustiveDependencies` already covers this.
      'react-hooks/exhaustive-deps': 'off',
    },
  },
]);
