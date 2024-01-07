import authenticate from "../middlewares/authenticate";
import express from "express";
import goals from "../controllers/goals";
const router = express.Router();

router.get("/token", authenticate, goals.getGoalSiteToken);

module.exports = router;
