import express from "express";
import { createImpersonationRequestValidator, updateImpersonationRequestValidator } from "../middlewares/validators/impersonationRequests";
import authenticate from "../middlewares/authenticate";
import { createImpersonationRequestController, updateImpersonationRequestStatusController } from "../controllers/impersonationRequests";
const router = express.Router();
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");


router.post(
  "/requests",
  authenticate,
  authorizeRoles([SUPERUSER]),
  createImpersonationRequestValidator,
  createImpersonationRequestController
);

router.patch(
  "/requests/:id",
  authenticate,
  updateImpersonationRequestValidator,
  updateImpersonationRequestStatusController
);

module.exports = router;