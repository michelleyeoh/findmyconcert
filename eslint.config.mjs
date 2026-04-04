import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';
import prettierPlugin from 'eslint-plugin-prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'build/**',
      'next-env.d.ts',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript', 'prettier'),
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs,cjs}'],
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': [
        'error',
        {
          bracketSpacing: true,
          tabWidth: 2,
          printWidth: 80,
          useTabs: false,
          trailingComma: 'es5',
          endOfLine: 'auto',
          semi: true,
          singleQuote: true,
        },
      ],
      'no-tabs': ['error', { allowIndentationTabs: false }],
      'no-mixed-spaces-and-tabs': 'error',
      'block-spacing': 1,
    },
  },
];

export default eslintConfig;
