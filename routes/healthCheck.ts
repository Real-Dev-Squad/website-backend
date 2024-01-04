import express from "express";
import authenticate from "../middlewares/authenticate";
import health from "../controllers/health";
const router = express.Router();

router.get("/", health.healthCheck);
router.get("/v2", authenticate, health.healthCheck);

module.exports = router;
