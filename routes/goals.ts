import express from "express";
import authenticate from "../middlewares/authenticate.js";
import { getGoalSiteToken } from "../controllers/goals.js";

const router = express.Router();

router.get("/token", authenticate, getGoalSiteToken);

export default router;
