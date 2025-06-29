import express from "express";
import { createImpersonationRequestValidator, getImpersonationRequestByIdValidator, getImpersonationRequestsValidator, updateImpersonationRequestValidator, impersonationSessionValidator } from "../middlewares/validators/impersonationRequests";
import authenticate from "../middlewares/authenticate";
import { createImpersonationRequestController, getImpersonationRequestByIdController, getImpersonationRequestsController, updateImpersonationRequestStatusController } from "../controllers/impersonationRequests";
import { addAuthorizationForImpersonation } from "../middlewares/addAuthorizationForImpersonation";
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

router.patch(
  "/requests/:id",
  authenticate,
  updateImpersonationRequestValidator,
  updateImpersonationRequestStatusController
);

router.patch(
    "/:id",
    authenticate,
    impersonationSessionValidator,
    addAuthorizationForImpersonation,
    impersonationController
);

module.exports = router;
