import express from "express";
import { getOpenPRs, getStalePRs, getUserPRs } from "../controllers/pullRequests.js";

const router = express.Router();

router.get("/open", getOpenPRs);
router.get("/stale", getStalePRs);
router.get("/user/:username", getUserPRs);

export default router;
