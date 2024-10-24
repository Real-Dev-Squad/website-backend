const express = require("express");
const router = express.Router();
const logs = require("../controllers/logs");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");

router.get("/:type", authenticate, authorizeRoles([SUPERUSER]), logs.fetchLogs);
router.get("/", authenticate, authorizeRoles([SUPERUSER]), logs.fetchAllLogs);
router.post("/migration", authenticate, authorizeRoles([SUPERUSER]), logs.updateLogs);

module.exports = router;
