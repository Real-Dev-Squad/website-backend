const express = require("express");
const router = express.Router();
const skills = require("../controllers/skills");
const authenticate = require("../middlewares/authenticate");
const skillValidator = require("../middlewares/validators/skills");

router.post("/:username", authenticate, skillValidator.awardSkill, skills.awardSkill);
router.get("/", skills.fetchSkills);
router.get("/:username", authenticate, skills.fetchUserSkills);

module.exports = router;
