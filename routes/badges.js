const express = require("express");
const router = express.Router();
const badge = require("../controllers/badge.js");

router.get("/", badge.getBadges);
router.get("/:username", badge.getUserBadges);

module.exports = router;
