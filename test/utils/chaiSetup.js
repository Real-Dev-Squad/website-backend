/**
 * Global chai plugin registration (loaded via .mocharc.js `require`).
 *
 * chai-http v5 is a pure ESM plugin and chai v6's `use()` returns a fresh
 * exports object instead of mutating the shared one, so per-file
 * `chai.use(chaiHttp)` calls only register assertion methods for the whole
 * mocha process as a side effect. Registering once here guarantees the
 * HTTP assertions (`status`, `header`, ...) exist even when running a
 * single test file that never calls `use()` itself.
 */
const { use } = require("chai");
const { default: chaiHttp } = require("chai-http");

use(chaiHttp);
