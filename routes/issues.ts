import express from "express";
import issues from "../controllers/issues";
const router = express.Router();

router.get("/", issues.getIssues);
router.post("/updates", issues.issueUpdates);

module.exports = router;
