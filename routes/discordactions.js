import express from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  createGroupRole,
  getGroupsRoleId,
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
  deleteGroupRole,
  getPaginatedAllGroupRoles,
} from "../controllers/discordactions.js";
import {
  validateGroupRoleBody,
  validateMemberRoleBody,
  validateUpdateUsersNicknameStatusBody,
  validateLazyLoadingParams,
} from "../middlewares/validators/discordactions.js";
import checkIsVerifiedDiscord from "../middlewares/verifydiscord.js";
import checkCanGenerateDiscordLink from "../middlewares/checkCanGenerateDiscordLink.js";
import { ROLES } from "../constants/roles.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { Services } from "../constants/bot.js";
import { verifyCronJob } from "../middlewares/authorizeBot.js";
import { authorizeAndAuthenticate } from "../middlewares/authorizeUsersAndService.js";

const router = express.Router();

router.post("/groups", authenticate, checkIsVerifiedDiscord, validateGroupRoleBody, createGroupRole);
router.get("/groups", authenticate, checkIsVerifiedDiscord, validateLazyLoadingParams, getPaginatedAllGroupRoles);
router.delete(
  "/groups/:groupId",
  authenticate,
  checkIsVerifiedDiscord,
  authorizeRoles([ROLES.SUPERUSER]),
  deleteGroupRole
);
router.post("/roles", authenticate, checkIsVerifiedDiscord, validateMemberRoleBody, addGroupRoleToMember);
router.get("/invite", authenticate, getUserDiscordInvite);
router.post("/invite", authenticate, checkCanGenerateDiscordLink, generateInviteForUser);
router.delete("/roles", authenticate, checkIsVerifiedDiscord, deleteRole);
router.get("/roles", authenticate, checkIsVerifiedDiscord, getGroupsRoleId);
router.patch(
  "/avatar/verify/:id",
  authenticate,
  authorizeRoles([ROLES.SUPERUSER]),
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
router.post("/discord-roles", authenticate, authorizeRoles([ROLES.SUPERUSER]), syncDiscordGroupRolesInFirestore);
router.put(
  "/group-onboarding-31d-plus",
  authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]),
  setRoleToUsersWith31DaysPlusOnboarding
);
export default router;
