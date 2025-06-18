import express from "express";
import { getImpersonationRequestsValidator } from "../middlewares/validators/impersonationRequests";
import { getImpersonationRequestsController } from "../controllers/impersonationRequests";
import authenticate from "../middlewares/authenticate";
import { devFlagMiddleware } from "../middlewares/devFlag";

const router = express.Router();

router.get(
  "/requests",
  devFlagMiddleware,
  authenticate,
  getImpersonationRequestsValidator,
  getImpersonationRequestsController
);

module.exports = router;