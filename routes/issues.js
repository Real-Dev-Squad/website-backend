const express = require("express");
const router = express.Router();
const issues = require("../controllers/issues");

router.get("/", issues.getIssues);
router.post("/updates", issues.issueUpdates);

module.exports = router;
