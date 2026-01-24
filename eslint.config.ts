import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fixupConfigRules, fixupPluginRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import unusedImports from 'eslint-plugin-unused-imports';
import typescriptEslintEslintPlugin from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

const compatConfigs = compat.extends(
  'plugin:@typescript-eslint/recommended',
  'plugin:prettier/recommended',
  'plugin:import/recommended',
);

export default defineConfig([
  ...fixupConfigRules(compatConfigs as Parameters<typeof fixupConfigRules>[0]),
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    plugins: {
      'unused-imports': fixupPluginRules(unusedImports),
    },
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parser: typescriptEslintEslintPlugin.parser,
    },
    settings: {
      'import/resolver': {
        typescript: {},
      },
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'all',
          argsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'import/no-useless-path-segments': ['error'],

      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],

      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
            'type',
          ],

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },

          'newlines-between': 'always',
        },
      ],

      'no-restricted-globals': [
        'error',
        {
          name: 'isNaN',
          message: 'Use Number.isNaN',
        },
      ],
      'import/no-restricted-paths': [
        'error',
        {
          zones: [
            // Domain層のimport制限
            {
              from: './src/application/**/*',
              target: './src/domain/**/!(*.spec.ts|*.test.ts)',
              message: 'Domain層でApplication層をimportしてはいけません。',
            },
            {
              from: './src/presentation/**/*',
              target: './src/domain/**/!(*.spec.ts|*.test.ts)',
              message: 'Domain層でPresentation層をimportしてはいけません。',
            },
            {
              from: './src/infrastructure/**/*',
              target: './src/domain/**/!(*.spec.ts|*.test.ts)',
              message: 'Domain層でInfrastructure層をimportしてはいけません。',
            },
            // Application層のimport制限
            {
              from: './src/presentation/**/*',
              target: './src/application/**/!(*.spec.ts|*.test.ts)',
              message:
                'Application層でPresentation層をimportしてはいけません。',
            },
            {
              from: './src/infrastructure/**/*',
              target: './src/application/**/!(*.spec.ts|*.test.ts)',
              message:
                'Application層でInfrastructure層をimportしてはいけません。',
            },
            // Presentation層のimport制限
            {
              from: './src/domain/**/*',
              target: './src/presentation/**/!(*.spec.ts|*.test.ts)',
              message: 'Presentation層でDomain層をimportしてはいけません。',
            },
            {
              from: './src/infrastructure/**/*',
              target: './src/presentation/**/!(*.spec.ts|*.test.ts)',
              message:
                'Presentation層でInfrastructure層をimportしてはいけません。',
            },
            // Infrastructure層のimport制限
            {
              from: './src/application/**/*',
              target: './src/infrastructure/**/!(*.spec.ts|*.test.ts)',
              message:
                'Infrastructure層でApplication層をimportしてはいけません。',
            },
            {
              from: './src/presentation/**/*',
              target: './src/infrastructure/**/!(*.spec.ts|*.test.ts)',
              message:
                'Infrastructure層でPresentation層をimportしてはいけません。',
            },
          ],
        },
      ],
    },
  },
]);
