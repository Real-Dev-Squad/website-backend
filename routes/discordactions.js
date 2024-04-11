const express = require("express");
const authenticate = require("../middlewares/authenticate");
const {
  createGroupRole,
  getGroupsRoleId,
  getAllGroupRoles,
  addGroupRoleToMember,
  deleteRole,
  updateDiscordImageForVerification,
  setRoleIdleToIdleUsers,
  getUserDiscordInvite,
  generateInviteForUser,
  setRoleIdle7DToIdleUsers,
  updateDiscordNicknames,
  updateUsersNicknameStatus,
  syncDiscordGroupRolesInFirestore,
  setRoleToUsersWith31DaysPlusOnboarding,
} = require("../controllers/discordactions");
const {
  validateGroupRoleBody,
  validateMemberRoleBody,
  validateUpdateUsersNicknameStatusBody,
} = require("../middlewares/validators/discordactions");
const checkIsVerifiedDiscord = require("../middlewares/verifydiscord");
const checkCanGenerateDiscordLink = require("../middlewares/checkCanGenerateDiscordLink");
const { SUPERUSER } = require("../constants/roles");
const authorizeRoles = require("../middlewares/authorizeRoles");
const ROLES = require("../constants/roles");
const { Services } = require("../constants/bot");
const { verifyCronJob } = require("../middlewares/authorizeBot");
const { authorizeAndAuthenticate } = require("../middlewares/authorizeUsersAndService");

const router = express.Router();

router.post("/groups", authenticate, checkIsVerifiedDiscord, validateGroupRoleBody, createGroupRole);
router.get("/groups", authenticate, checkIsVerifiedDiscord, getAllGroupRoles);
router.post("/roles", authenticate, checkIsVerifiedDiscord, validateMemberRoleBody, addGroupRoleToMember);
router.get("/invite", authenticate, getUserDiscordInvite);
router.post("/invite", authenticate, checkCanGenerateDiscordLink, generateInviteForUser);
router.delete("/roles", authenticate, checkIsVerifiedDiscord, deleteRole);
router.get("/roles", authenticate, checkIsVerifiedDiscord, getGroupsRoleId);
// TODO deprecate the below API, for incorrect naming
router.patch(
  "/avatar/verify/:id",
  authenticate,
  authorizeRoles([SUPERUSER]),
  checkIsVerifiedDiscord,
  updateDiscordImageForVerification
);
router.patch(
  "/avatar/update/:discordId",
  authenticate,
  authorizeRoles([SUPERUSER]),
  checkIsVerifiedDiscord,
  updateDiscordImageForVerification
);
router.put(
  "/group-idle",
  authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]),
  setRoleIdleToIdleUsers
);
router.put(
  "/group-idle-7d",
  authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]),
  setRoleIdle7DToIdleUsers
);
router.post(
  "/nicknames/sync",
  authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]),
  updateDiscordNicknames
);
router.post("/nickname/status", verifyCronJob, validateUpdateUsersNicknameStatusBody, updateUsersNicknameStatus);
router.post("/discord-roles", authenticate, authorizeRoles([SUPERUSER]), syncDiscordGroupRolesInFirestore);
router.put(
  "/group-onboarding-31d-plus",
  authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]),
  setRoleToUsersWith31DaysPlusOnboarding
);
module.exports = router;
