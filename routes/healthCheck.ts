import express from "express";
import authenticate from "../middlewares/authenticate";
import { healthCheck } from "../controllers/health";

const router = express.Router();

router.get("/", healthCheck);
router.get("/v2", authenticate, healthCheck);

export default router;
