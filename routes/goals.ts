import authenticate from "../middlewares/authenticate";
import express from "express";
import { getGoalSiteToken } from "../controllers/goals";
const router = express.Router();

router.get("/token", authenticate, getGoalSiteToken);

export default router;
