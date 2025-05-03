import express from "express";
import authenticate from "../middlewares/authenticate.js";
import { healthCheck } from "../controllers/health.js";

const router = express.Router();

router.get("/", healthCheck);
router.get("/v2", authenticate, healthCheck);

export default router;
