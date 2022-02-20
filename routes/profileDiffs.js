const express = require("express");
const router = express.Router();
const profileDiffs = require("../controllers/profileDiffs");
const { authorizeUser } = require("../middlewares/authorization");
const authenticate = require("../middlewares/authenticate");

router.get("/", authenticate, authorizeUser("superUser"), profileDiffs.getProfileDiffs);

module.exports = router;
