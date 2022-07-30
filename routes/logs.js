const express = require("express");
const router = express.Router();
const logs = require("../controllers/logs");
const authenticate = require("../middlewares/authenticate");
const { authorizeUser } = require("../middlewares/authorization");
const { ROLES } = require("../constants/users");

router.get("/:type", authenticate, authorizeUser(ROLES.SUPER_USER), logs.fetchLogs);
router.get("/cache/clear", authenticate, logs.fetchMemberCacheLogs);

module.exports = router;
