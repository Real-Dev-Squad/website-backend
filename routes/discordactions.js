const express = require("express");
const authenticate = require("../middlewares/authenticate");
const {
  createGroupRole,
  getAllGroupRoles,
  addGroupRoleToMember,
  updateDiscordImageForVerification,
  changeNicknameOfUsers,
  
} = require("../controllers/discordactions");

const {
  validateGroupRoleBody,
  validateMemberRoleBody,
  updateDiscordImageForVerification,
} = require("../controllers/discordactions");
const { validateGroupRoleBody, validateMemberRoleBody } = require("../middlewares/validators/discordactions");
const checkIsVerifiedDiscord = require("../middlewares/verifydiscord");
const { SUPERUSER } = require("../constants/roles");
const authorizeRoles = require("../middlewares/authorizeRoles");

const router = express.Router();

router.post("/groups", authenticate, checkIsVerifiedDiscord, validateGroupRoleBody, createGroupRole);
router.get("/groups", authenticate, checkIsVerifiedDiscord, getAllGroupRoles);
router.post("/roles", authenticate, checkIsVerifiedDiscord, validateMemberRoleBody, addGroupRoleToMember);
router.patch("/nickname", authenticate,authorizeRoles([SUPERUSER]),checkIsVerifiedDiscord,changeNicknameOfUsers )
router.post("/nickname", authenticate, checkIsVerifiedDiscord, ValidateNickNamechangeBody, changeNicknameOfUsers);
router.patch(
  "/avatar/verify/:id",
  authenticate,
  authorizeRoles([SUPERUSER]),
  checkIsVerifiedDiscord,
  updateDiscordImageForVerification
);


module.exports = router;
