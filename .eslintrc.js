/**
 * Eslint config file.
 */
module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    mocha: true,
  },
  extends: ["standard", "plugin:mocha/recommended", "plugin:security/recommended", "plugin:prettier/recommended"],
  plugins: ["mocha", "security", "prettier"],
  parserOptions: {
    ecmaVersion: 12,
  },
  globals: {
    config: "readonly",
    logger: "readonly",
  },
  rules: {
    // Custom eslint rules
    "no-trailing-spaces": "error",
    "consistent-return": "error",
    "no-console": "error",

    // Custom mocha rules
    "mocha/no-skipped-tests": "error",
    "mocha/no-exclusive-tests": "error",

    // Prettier for formatting
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],
  },
  ignorePatterns: ["public/*"],
};
