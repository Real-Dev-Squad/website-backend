const express = require("express");
const router = express.Router();
const pullRequest = require("../controllers/pullRequests");

router.get("/open", pullRequest.getOpenPRs);
router.get("/stale", pullRequest.getStalePRs);
router.get("/user/:username", pullRequest.getUserPRs);

module.exports = router;
