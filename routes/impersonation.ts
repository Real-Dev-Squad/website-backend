import express from "express";
import { createImpersonationRequestValidator, getImpersonationRequestByIdValidator, getImpersonationRequestsValidator, updateImpersonationRequestValidator, impersonationSessionValidator } from "../middlewares/validators/impersonationRequests";
import authenticate from "../middlewares/authenticate";
import { createImpersonationRequestController, getImpersonationRequestByIdController, getImpersonationRequestsController, impersonationController, updateImpersonationRequestStatusController } from "../controllers/impersonationRequests";
import { addAuthorizationForImpersonation } from "../middlewares/addAuthorizationForImpersonation";
const router = express.Router();
import {authorizeRoles} from "../middlewares/authorizeRoles";
import { SUPERUSER } from "../constants/roles";

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
