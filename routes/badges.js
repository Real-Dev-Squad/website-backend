const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const badgeValidator = require("../middlewares/validators/badge");
const { upload } = require("../utils/multer");
const badge = require("../controllers/badge.js");

router.get("/", badge.getBadges);
router.get("/:username", badge.getUserBadgeIds);
router.post("/", authenticate, upload.single("badge"), badgeValidator.createBadge, badge.postBadge);
router.post("/assign/:username", authenticate, badgeValidator.assignOrUnassignBadges, badge.postUserBadges);
router.delete("/unassign/:username", authenticate, badgeValidator.assignOrUnassignBadges, badge.deleteUserBadge);

module.exports = router;
