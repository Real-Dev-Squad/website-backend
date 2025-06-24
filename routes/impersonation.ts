import express from "express";
import { createImpersonationRequestValidator, getImpersonationRequestByIdValidator, getImpersonationRequestsValidator } from "../middlewares/validators/impersonationRequests";
const router = express.Router();
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
import authenticate from "../middlewares/authenticate";
import { createImpersonationRequestController, getImpersonationRequestByIdController, getImpersonationRequestsController } from "../controllers/impersonationRequests";

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

router.get(
   "/requests/:id",
   authenticate,
   getImpersonationRequestByIdValidator,
   getImpersonationRequestByIdController
);

module.exports = router;