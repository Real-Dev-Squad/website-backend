import js from "@eslint/js";
import globals from "globals";
import mochaPlugin from "eslint-plugin-mocha";
import securityPlugin from "eslint-plugin-security";
import prettierPlugin from "eslint-plugin-prettier";

export default [
  {
    ignores: ["dist/*", "**/.eslintrc.js", "public/*"],
  },
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.mocha,
        config: "readonly",
        logger: "readonly",
      },
    },
    plugins: {
      mocha: mochaPlugin,
      security: securityPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      // Custom eslint rules
      "no-trailing-spaces": "error",
      "consistent-return": "error",
      "no-console": "error",

      // Mocha rules
      "mocha/no-pending-tests": "error",
      "mocha/no-exclusive-tests": "error",

      // Prettier for formatting
      "prettier/prettier": "error",

      "no-unused-vars": "warn",
    },
  },
];
