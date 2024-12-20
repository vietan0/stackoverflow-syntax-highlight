import antfu from '@antfu/eslint-config';

export default antfu({
  stylistic: {
    semi: true,
  },
  languageOptions: {
    globals: {
      browser: 'readonly',
    },
  },
  rules: {
    'no-console': 'off',
    'no-unused-vars': 'warn',
    'unused-imports/no-unused-imports': 'warn',
    'unused-imports/no-unused-vars': 'warn',
    'style/padding-line-between-statements': [
      'warn',
      { blankLine: 'always', prev: '*', next: ['return', 'export'] },
      { blankLine: 'never', prev: 'export', next: 'export' },
      {
        blankLine: 'always',
        prev: 'import',
        next: ['const', 'let', 'function', 'block-like', 'interface'],
      },
      {
        blankLine: 'always',
        prev: [
          'multiline-expression',
          'multiline-block-like',
          'multiline-const',
          'interface',
        ],
        next: '*',
      },
      {
        blankLine: 'always',
        prev: '*',
        next: [
          'multiline-expression',
          'multiline-block-like',
          'multiline-const',
          'interface',
        ],
      },
      {
        blankLine: 'never',
        prev: ['singleline-const', 'singleline-let', 'singleline-var'],
        next: ['singleline-const', 'singleline-let', 'singleline-var'],
      },
    ],
    'import/order': 'off',
    'perfectionist/sort-jsx-props': 'error',
    'perfectionist/sort-imports': [
      'error',
      {
        groups: [
          'builtin',
          ['external', 'internal'],
          ['parent', 'sibling', 'index'],
          [
            'internal-type',
            'type',
            'parent-type',
            'sibling-type',
            'index-type',
          ],
          ['side-effect', 'side-effect-style'],
        ],
      },
    ],
    'test/consistent-test-it': ['error', { fn: 'test' }],
    'jsonc/sort-keys': [
      'error',
      {
        pathPattern: '^(scripts|(d|(devD))ependencies)$',
        order: { type: 'asc' },
      },
    ],
  },
});
