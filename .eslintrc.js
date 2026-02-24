module.exports = {
  root: true,
  extends: '@react-native',
  env: {
    jest: true,
  },
  rules: {
    '@typescript-eslint/no-unused-vars': ['error', {
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      caughtErrorsIgnorePattern: '^_',
    }],
  },
  overrides: [
    {
      files: ['jest.setup.js', '**/*.test.ts', '**/*.test.tsx', '__tests__/**/*'],
      rules: {
        '@react-native/no-deep-imports': 'off',
      },
    },
  ],
};
