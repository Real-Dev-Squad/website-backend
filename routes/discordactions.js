const express = require("express");
const authenticate = require("../middlewares/authenticate");
const {
  createGroupRole,
  getAllGroupRoles,
  addGroupRoleToMember,
  getDiscordMembers,
} = require("../controllers/discordactions");
const { validateGroupRoleBody, validateMemberRoleBody } = require("../middlewares/validators/discordactions");
const checkIsVerifiedDiscord = require("../middlewares/verifydiscord");

const router = express.Router();

router.post("/groups", authenticate, checkIsVerifiedDiscord, validateGroupRoleBody, createGroupRole);
router.get("/groups", authenticate, checkIsVerifiedDiscord, getAllGroupRoles);
router.post("/roles", authenticate, checkIsVerifiedDiscord, validateMemberRoleBody, addGroupRoleToMember);
router.get("/members", authenticate, checkIsVerifiedDiscord, getDiscordMembers);
module.exports = router;
