/**
 * Nyc coverage config
 * Documentation: https://github.com/istanbuljs/nyc#common-configuration-options
 */
module.exports = {
  all: true,
  "check-coverage": false, // Will be enabled after reaching 50% coverage: https://github.com/Real-Dev-Squad/website-backend/issues/493
  exclude: ["test/**"],
  reporter: ["text", "lcov", "text-summary"],
  reportDir: ".coverage",
  tempDir: ".coverage",
  branches: 50,
  lines: 50,
  functions: 50,
  statements: 50,
  watermarks: {
    lines: [75, 90],
    functions: [75, 90],
    branches: [75, 90],
    statements: [75, 90],
  },
};
