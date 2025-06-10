import express from "express";
import { createImpersonationRequestValidator } from "../middlewares/validators/impersonationRequests";
import { createImpersonationRequestController } from "../controllers/impersonationRequests";
const router = express.Router();
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
import authenticate from "../middlewares/authenticate";
import rateLimit from "express-rate-limit";
const config = require("config");

router.post(
  "/requests",
  rateLimit(config.get("rateLimitConfig")),
  authenticate,
  authorizeRoles([SUPERUSER]),
  createImpersonationRequestValidator,
  createImpersonationRequestController
);

module.exports = router;