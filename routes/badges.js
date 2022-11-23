const express = require("express");
const router = express.Router();
const badge = require("../controllers/badge.js");

router.get("/", badge.getBadges);
router.post("/", badge.postBadge);
router.get("/:username", badge.getUserBadges);
router.post("/:username", badge.postUserBadge);
router.delete("/:username", badge.deleteUserBadge);

module.exports = router;
