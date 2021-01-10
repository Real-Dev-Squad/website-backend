/**
 * Nyc coverage config
 * Documentation: https://github.com/istanbuljs/nyc#common-configuration-options
 */
module.exports = {
  all: true,
  exclude: [
    '**/test.js'
  ],
  reporter: ['text', 'lcov', 'text-summary'],
  reportDir: '.coverage',
  tempDir: '.coverage'
}
