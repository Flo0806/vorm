import antfu from '@antfu/eslint-config'

export default antfu(
  {
    typescript: true,
    vue: true,
    formatters: true
  },
  {
    rules: {
      // Stylistic rules
      'style/semi': ['error', 'never'],
      'style/quotes': ['error', 'single'],
      'style/comma-dangle': ['error', 'never'], // 👈 Keine trailing commas!

      // TypeScript rules
      '@typescript-eslint/no-explicit-any': 'off',
      'ts/no-explicit-any': 'off',

      // General rules
      'no-console': 'off',
      'vue/multi-word-component-names': 'off',

      // Import rules
      'import/order': 'off',
      'sort-imports': 'off'
    }
  }
)
