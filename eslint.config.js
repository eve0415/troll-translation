import tanstackPlugin from '@tanstack/eslint-plugin-router';
import { defineConfig } from 'eslint/config';
// @ts-expect-error
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['specs', '.tanstack', 'src/routeTree.gen.ts', 'tanstack-start.d.ts', 'worker-configuration.d.ts', '.wrangler', 'dist'],
  },
  ...tseslint.configs.recommendedTypeCheckedOnly,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        EXPERIMENTAL_useProjectService: true,
      },
    },
    rules: {
      '@typescript-eslint/prefer-nullish-coalescing': [
        'error',
        {
          ignorePrimitives: true,
        },
      ],
    },
  },
  {
    settings: {
      react: { version: 'detect' },
    },
    extends: [
      reactPlugin.configs.flat.recommended,
      reactPlugin.configs.flat['jsx-runtime'],
      // @ts-expect-error
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      reactHooksPlugin.configs['recommended-latest'],
    ],
  },
  {
    plugins: {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      'jsx-a11y': jsxA11yPlugin,
    },
    rules: {
      'react/no-unknown-property': 'error',
    },
  },
  {
    extends: tanstackPlugin.configs['flat/recommended'],
    rules: {
      '@tanstack/router/create-route-property-order': 'error',
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [
            {
              from: 'package',
              name: 'Redirect',
              package: '@tanstack/router-core',
            },
            {
              from: 'package',
              name: 'NotFoundError',
              package: '@tanstack/router-core',
            },
            {
              from: 'package',
              name: 'JsonResponse',
              package: '@tanstack/router-core',
            },
          ],
        },
      ],
    },
  },
);
