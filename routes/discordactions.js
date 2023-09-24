const express = require("express");
const authenticate = require("../middlewares/authenticate");
const {
  createGroupRole,
  getAllGroupRoles,
  addGroupRoleToMember,
  updateDiscordImageForVerification,
  setRoleIdleToIdleUsers,
  getUserDiscordInvite,
  generateInviteForUser,
} = require("../controllers/discordactions");
const { validateGroupRoleBody, validateMemberRoleBody } = require("../middlewares/validators/discordactions");
const checkIsVerifiedDiscord = require("../middlewares/verifydiscord");
const checkCanGenerateDiscordLink = require("../middlewares/checkCanGenerateDiscordLink");
const { SUPERUSER } = require("../constants/roles");
const authorizeRoles = require("../middlewares/authorizeRoles");

const router = express.Router();

router.post("/groups", authenticate, checkIsVerifiedDiscord, validateGroupRoleBody, createGroupRole);
router.get("/groups", authenticate, checkIsVerifiedDiscord, getAllGroupRoles);
router.post("/roles", authenticate, checkIsVerifiedDiscord, validateMemberRoleBody, addGroupRoleToMember);
router.get("/invite", authenticate, getUserDiscordInvite);
router.post("/invite", authenticate, checkCanGenerateDiscordLink, generateInviteForUser);
router.patch(
  "/avatar/verify/:id",
  authenticate,
  authorizeRoles([SUPERUSER]),
  checkIsVerifiedDiscord,
  updateDiscordImageForVerification
);
router.put("/group-idle", authenticate, authorizeRoles([SUPERUSER]), setRoleIdleToIdleUsers);

module.exports = router;
