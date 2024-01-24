import express from "express";
import pullRequest from "../controllers/pullRequests";
const router = express.Router();

router.get("/open", pullRequest.getOpenPRs);
router.get("/stale", pullRequest.getStalePRs);
router.get("/user/:username", pullRequest.getUserPRs);

module.exports = router;
