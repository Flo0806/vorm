// @ts-check
import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      // TypeScript
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],

      // Console is OK in Nuxt modules
      'no-console': 'off',

      // Quotes and semi
      'quotes': ['error', 'single'],
      'semi': ['error', 'never']
    }
  },
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '.nuxt/**',
      'playground/.nuxt/**',
      'playground/.output/**',
      'coverage/**'
    ]
  }
)
