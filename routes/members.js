const express = require("express");
const router = express.Router();
const members = require("../controllers/members");
const authorizeRoles = require("../middlewares/authorizeRoles");
const authenticate = require("../middlewares/authenticate");
const { addRecruiter, fetchRecruitersInfo } = require("../controllers/recruiters");
const { validateRecruiter } = require("../middlewares/validators/recruiter");
const { validateGetMembers } = require("../middlewares/validators/members");
const { SUPERUSER } = require("../constants/roles");

router.get("/", validateGetMembers, members.getMembers);
router.get("/idle", members.getIdleMembers);
router.post("/intro/:username", validateRecruiter, addRecruiter);
router.get("/intro", authenticate, authorizeRoles([SUPERUSER]), fetchRecruitersInfo);
router.patch("/moveToMembers/:username", authenticate, authorizeRoles([SUPERUSER]), members.moveToMembers);
router.patch("/archiveMembers/:username", authenticate, authorizeRoles([SUPERUSER]), members.archiveMembers);

module.exports = router;
