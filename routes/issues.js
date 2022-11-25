const express = require("express");
const router = express.Router();
const issues = require("../controllers/issues");

router.get("/:repo", issues.getIssues);

module.exports = router;
