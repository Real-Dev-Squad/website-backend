const express = require("express");
const router = express.Router();
const logs = require("../controllers/logs");
const authenticate = require("../middlewares/authenticate");
const { authorizeUser } = require("../middlewares/authorization");
const { LEGACY_ROLES } = require("../constants/roles");

router.get("/:type", authenticate, authorizeUser(LEGACY_ROLES.SUPER_USER), logs.fetchLogs);

module.exports = router;
