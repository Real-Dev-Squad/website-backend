const express = require("express");
const issues = require("../controllers/issues");
const router = express.Router();

router.get("/", issues.getIssues);
router.post("/updates", issues.issueUpdates);

module.exports = router;
