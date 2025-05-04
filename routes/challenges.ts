import express from "express";
import authenticate from "../middlewares/authenticate.js";
import * as challenges from "../controllers/challenge.js";
import { createChallenge } from "../middlewares/validators/challenges.js";

const router = express.Router();
router.get("/", authenticate, challenges.fetchChallenges);
router.post("/", authenticate, createChallenge, challenges.createChallenge);
router.post("/subscribe", authenticate, challenges.subscribeToChallenge);

export default router;
