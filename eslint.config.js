const typescriptEslint = require('@typescript-eslint/eslint-plugin');
const typescriptParser = require('@typescript-eslint/parser');
const react = require('eslint-plugin-react');
const prettier = require('eslint-plugin-prettier');

module.exports = [
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      'tsconfig.json',
      '.pnp.js',
      '.yarn/',
      'dist/',
      '.next/',
      'webDist/',
      'distWeb/',
      'distLambda/',
      'goldstackLocal/',
      'node_modules/',
      'coverage/',
      '!.*.json', // Include hidden JSON files
      '!.github', // Include .github directory
    ],
  },
  // Main configuration for JS/TS/TSX files
  {
    files: ['**/*.{js,ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2018,
        sourceType: 'module',
      },
      globals: {
        Atomics: 'readonly',
        SharedArrayBuffer: 'readonly',
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        global: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
      react: react,
      prettier: prettier,
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    rules: {
      // Base rules
      'linebreak-style': ['error', 'unix'],
      quotes: [
        'warn',
        'single',
        {
          avoidEscape: true,
        },
      ],
      semi: ['error', 'always'],
      // Prettier integration
      'prettier/prettier': 'error',
      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/type-annotation-spacing': 'off',
      // React rules
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
    },
  },
  // Configuration for JSON files (basic linting)
  {
    files: ['**/*.json'],
    rules: {
      // Basic JSON validation will be handled by the editor
    },
  },
  // Configuration for YAML files (basic linting)
  {
    files: ['**/*.{yaml,yml}'],
    rules: {
      // Basic YAML validation will be handled by the editor
    },
  },
  // Configuration for HTML files (basic linting)
  {
    files: ['**/*.html'],
    rules: {
      // Basic HTML validation will be handled by the editor
    },
  },
];
