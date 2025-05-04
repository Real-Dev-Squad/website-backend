import express from "express";
import { getIssues, issueUpdates } from "../controllers/issues.js";

const router = express.Router();

router.get("/", getIssues);
router.post("/updates", issueUpdates);

export default router;
