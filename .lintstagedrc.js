module.exports = {
  // TypeScript and JavaScript files
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write'
  ],

  // JSON, Markdown, and YAML files
  '*.{json,md,yml,yaml}': [
    'prettier --write'
  ],

  // CSS and SCSS files
  '*.{css,scss}': [
    'prettier --write'
  ],

  // Backend specific
  'backend/**/*.{ts,js}': [
    'eslint --fix --config backend/.eslintrc.js',
    'prettier --write'
  ],

  // Web admin specific
  'web-admin/**/*.{ts,tsx,js,jsx}': [
    'eslint --fix --config web-admin/.eslintrc.js',
    'prettier --write'
  ],

  // Mobile app specific
  'mobile-app/**/*.{ts,tsx,js,jsx}': [
    'eslint --fix --config mobile-app/.eslintrc.js',
    'prettier --write'
  ],

  // Run tests for modified test files
  '**/*.{test,spec}.{ts,tsx,js,jsx}': [
    'jest --bail --findRelatedTests'
  ]
};