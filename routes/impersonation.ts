import express from "express";
import { createImpersonationRequestValidator, getImpersonationRequestsValidator } from "../middlewares/validators/impersonationRequests";
const router = express.Router();
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
import authenticate from "../middlewares/authenticate";
import { createImpersonationRequestController, getImpersonationRequestsController } from "../controllers/impersonationRequests";

router.post(
  "/requests",
  authenticate,
  authorizeRoles([SUPERUSER]),
  createImpersonationRequestValidator,
  createImpersonationRequestController
);

router.get(
  "/requests",
  authenticate,
  getImpersonationRequestsValidator,
  getImpersonationRequestsController
);

module.exports = router;