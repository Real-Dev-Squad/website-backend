/**
 * ESLint flat config (ESLint 9+ format, required by ESLint 10).
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import globals from "globals";
import mochaPlugin from "eslint-plugin-mocha";
import securityPlugin from "eslint-plugin-security";
import prettierRecommended from "eslint-plugin-prettier/recommended";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({ baseDirectory: __dirname });

export default [
  {
    ignores: ["public/**", "dist/**"],
  },
  ...compat.extends("standard"),
  mochaPlugin.configs.recommended,
  securityPlugin.configs.recommended,
  prettierRecommended,
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: 13,
      sourceType: "commonjs",
      globals: {
        ...globals.es2021,
        ...globals.node,
        ...globals.mocha,
        config: "readonly",
        logger: "readonly",
      },
    },
    plugins: {
      mocha: mochaPlugin,
      security: securityPlugin,
    },
    rules: {
      "no-trailing-spaces": "error",
      "consistent-return": "error",
      "no-console": "error",
      "mocha/no-pending-tests": "error",
      "mocha/no-exclusive-tests": "error",
      "prettier/prettier": "error",
    },
  },
  // A few .js files use ESM import/export syntax (the runtime loads them
  // through ts-node / Node's module detection). They need module source type.
  // (eslint.config.mjs itself is ESM by extension, so it needs no entry here.)
  {
    files: [
      "controllers/logs.js",
      "middlewares/validators/fcmToken.js",
      "middlewares/validators/notify.js",
      "middlewares/validators/task-requests.js",
      "models/userStatus.js",
      "services/getFcmTokenFromUserId.js",
      "services/getUserIdsFromRoleId.js",
      "test/fixtures/logs/archievedUsers.js",
      "test/fixtures/logs/extensionRequests.js",
      "test/fixtures/logs/requests.js",
      "test/fixtures/logs/tasks.js",
      "test/integration/logs.test.js",
      "test/unit/models/userStatus.js",
      "test/unit/utils/rqlQueryParser.test.js",
      "test/unit/utils/sendTaskUpdate.test.js",
      "utils/queryParser.js",
      "utils/sendTaskUpdate.js",
    ],
    languageOptions: {
      sourceType: "module",
    },
  },
];
