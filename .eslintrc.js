module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    // Temporarily disable problematic rules for deployment
    'react/no-unescaped-entities': 'off',
    'react-hooks/exhaustive-deps': 'warn',
    '@next/next/no-img-element': 'warn',
    'react-hooks/rules-of-hooks': 'error',
    'react/jsx-key': 'error'
  }
}
