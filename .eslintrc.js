/**
 * Eslint config file.
 */
module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    mocha: true
  },
  extends: [
    'standard',
    'plugin:mocha/recommended',
    'plugin:security/recommended'
  ],
  plugins: [
    'mocha',
    'security'
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    // Custom eslint rules
    'no-trailing-spaces': 'error',
    'consistent-return': 'error',

    // Custom mocha rules
    'mocha/no-skipped-tests': 'error',
    'mocha/no-exclusive-tests': 'error'
  },
  ignorePatterns: ['public/*']
}
