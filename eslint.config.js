const { defineConfig } = require("eslint/config");
const globals = require("globals");
const mocha = require("eslint-plugin-mocha");
const security = require("eslint-plugin-security");
const prettier = require("eslint-plugin-prettier");

module.exports = defineConfig([
  {
    ignores: ["dist/*", "**/.eslintrc.js", "public/*"],
  },
  {
    languageOptions: {
      globals: {
        ...globals.commonjs,
        ...globals.node,
        ...globals.mocha,
        ...globals.es2021,
        config: "readonly",
        logger: "readonly",
      },

      ecmaVersion: 13,
      parserOptions: {},
    },

    plugins: {
      mocha,
      security,
      prettier,
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
      "prettier/prettier": "error",
    },
  },
]);
