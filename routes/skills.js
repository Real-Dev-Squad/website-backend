const express = require("express");
const router = express.Router();
const skills = require("../controllers/skills");
const authenticate = require("../middlewares/authenticate");

router.post("/:username", authenticate, skills.awardSkill);
router.get("/", skills.fetchSkills);
router.get("/:username", authenticate, skills.fetchUserSkills);

module.exports = router;
