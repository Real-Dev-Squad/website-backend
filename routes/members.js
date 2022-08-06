const express = require("express");
const router = express.Router();
const members = require("../controllers/members");
const { authorizeUser } = require("../middlewares/authorization");
const authenticate = require("../middlewares/authenticate");
const { addRecruiter, fetchRecruitersInfo } = require("../controllers/recruiters");
const { validateRecruiter } = require("../middlewares/validators/recruiter");
const {
  LEGACY_ROLES: { SUPER_USER },
} = require("../constants/roles");

router.get("/", members.getMembers);
router.get("/idle", members.getIdleMembers);
router.post("/intro/:username", validateRecruiter, addRecruiter);
router.get("/intro", authenticate, authorizeUser(SUPER_USER), fetchRecruitersInfo);
router.patch("/moveToMembers/:username", authenticate, authorizeUser(SUPER_USER), members.moveToMembers);
router.patch("/member-to-role-migration", authenticate, authorizeUser("superUser"), members.migrateUserRoles);
router.patch("/delete-isMember", authenticate, authorizeUser("superUser"), members.deleteIsMember);
router.patch("/archiveMembers/:username", authenticate, authorizeUser(SUPER_USER), members.archiveMembers);

module.exports = router;
