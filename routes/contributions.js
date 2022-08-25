const express = require("express");
const router = express.Router();
const contributions = require("../controllers/contributions");

router.get("/:username", contributions.getUserContributions);

module.exports = router;
