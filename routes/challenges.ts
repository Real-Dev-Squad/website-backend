import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
import * as challenges from "../controllers/challenge";
import { createChallenge } from "../middlewares/validators/challenges";

router.get("/", authenticate, challenges.fetchChallenges);
router.post("/", authenticate, createChallenge, challenges.createChallenge);
router.post("/subscribe", authenticate, challenges.subscribeToChallenge);

export default router;
