const express = require("express");
const router = express.Router();
const profileDiffs = require("../controllers/profileDiffs");
const authorizeRoles = require("../middlewares/authorizeRoles");
const authenticate = require("../middlewares/authenticate");
const { SUPERUSER } = require("../constants/roles");

router.get("/", authenticate, authorizeRoles([SUPERUSER]), profileDiffs.getProfileDiffs);

module.exports = router;
