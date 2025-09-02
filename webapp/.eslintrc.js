module.exports = {
  extends: [
    'next/core-web-vitals',
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  plugins: ['@typescript-eslint'],
  rules: {
    // Запрещаем жестко прошитый контент
    'no-hardcoded-content': 'error',
    
    // Дополнительные правила для TypeScript
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    
    // Общие правила
    'no-console': 'warn',
    'prefer-const': 'error',
    'no-var': 'error'
  },
  
  // Кастомное правило для проверки жестко прошитого контента
  overrides: [
    {
      files: ['**/*.{ts,tsx,js,jsx}'],
      rules: {
        'no-hardcoded-content': [
          'error',
          {
            // Паттерны для поиска русского текста
            patterns: [
              /[а-яё]+/i,
              /['"`][^'"`]*[а-яё]+[^'"`]*['"`]/i
            ],
            // Исключения (комментарии, console.log и т.д.)
            ignorePatterns: [
              /\/\/.*/,
              /\/\*[\s\S]*?\*\//,
              /console\.(log|warn|error)\(/,
              /['"`]\/.*\/[gimuy]*['"`]/ // regex
            ],
            // Сообщение об ошибке
            message: 'Жестко прошитый контент запрещен. Используйте CMS API или i18n.'
          }
        ]
      }
    }
  ]
};








