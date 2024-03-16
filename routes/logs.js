const express = require("express");
const router = express.Router();
const logs = require("../controllers/logs");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");

router.get("/:type", authenticate, authorizeRoles([SUPERUSER]), logs.fetchLogs);
router.post("/",logs.createLogs)

module.exports = router;
