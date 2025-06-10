import express from "express";
import { createImpersonationRequestValidator } from "../middlewares/validators/impersonationRequests";
const router = express.Router();
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
import authenticate from "../middlewares/authenticate";
import { createImpersonationRequestController } from "../controllers/impersonationRequests";

router.post(
  "/requests",
  authenticate,
  authorizeRoles([SUPERUSER]),
  createImpersonationRequestValidator,
  createImpersonationRequestController
);

module.exports = router;