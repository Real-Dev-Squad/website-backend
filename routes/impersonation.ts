import express from "express";
import { createImpersonationRequestValidator, getImpersonationRequestByIdValidator, getImpersonationRequestsValidator, updateImpersonationRequestValidator, impersonationSessionValidator } from "../middlewares/validators/impersonationRequests.js";
import authenticate from "../middlewares/authenticate.js";
import { createImpersonationRequestController, getImpersonationRequestByIdController, getImpersonationRequestsController, impersonationController, updateImpersonationRequestStatusController } from "../controllers/impersonationRequests.js";
import { addAuthorizationForImpersonation } from "../middlewares/addAuthorizationForImpersonation.js";
const router = express.Router();
import {authorizeRoles} from "../middlewares/authorizeRoles.js";
import { SUPERUSER } from "../constants/roles.js";

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

export default router;
