const express = require("express");
const authenticate = require("../middlewares/authenticate");
const { createGroupRole, getAllGroupRoles, addGroupRoleToMember, changeNicknameOfUsers } = require("../controllers/discordactions");
const { validateGroupRoleBody, validateMemberRoleBody , ValidateNickNamechangeBody} = require("../middlewares/validators/discordactions");
const checkIsVerifiedDiscord = require("../middlewares/verifydiscord");

const router = express.Router();

router.post("/groups", authenticate, checkIsVerifiedDiscord, validateGroupRoleBody, createGroupRole);
router.get("/groups", authenticate, checkIsVerifiedDiscord, getAllGroupRoles);
router.post("/roles", authenticate, checkIsVerifiedDiscord, validateMemberRoleBody, addGroupRoleToMember);
router.post("/nickname" , authenticate,checkIsVerifiedDiscord, ValidateNickNamechangeBody, changeNicknameOfUsers)

module.exports = router;
