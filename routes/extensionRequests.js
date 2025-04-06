import express from "express";
import * as extensionRequests from "../controllers/extensionRequests.js";
import authenticate from "../middlewares/authenticate.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { SUPERUSER, APPOWNER } from "../constants/roles.js";
import {
  createExtensionRequest,
  updateExtensionRequest,
  updateExtensionRequestStatus,
  getExtensionRequestsValidator,
} from "../middlewares/validators/extensionRequests.js";
import skipAuthorizeRolesUnderFF from "../middlewares/skipAuthorizeRolesWrapper.js";
import { userAuthorization } from "../middlewares/userAuthorization.js";
import { devFlagMiddleware } from "../middlewares/devFlag.js";

const router = express.Router();

router.post("/", authenticate, createExtensionRequest, extensionRequests.createTaskExtensionRequest);
router.get("/", authenticate, getExtensionRequestsValidator, extensionRequests.fetchExtensionRequests);
router.get("/self", authenticate, extensionRequests.getSelfExtensionRequests); // This endpoint is being deprecated. Please use `/extension-requests/user/:userId` route to get the user extension-requests details based on userID."
router.get(
  "/user/:userId",
  devFlagMiddleware,
  authenticate,
  userAuthorization,
  extensionRequests.getSelfExtensionRequests
);
router.get("/:id", authenticate, authorizeRoles([SUPERUSER, APPOWNER]), extensionRequests.getExtensionRequest);
//  remove the skipAuthorizeRolesUnderFF & authorizeRoles middleware when removing the feature flag
router.patch(
  "/:id",
  authenticate,
  skipAuthorizeRolesUnderFF(authorizeRoles([SUPERUSER, APPOWNER])),
  updateExtensionRequest,
  extensionRequests.updateExtensionRequest
);
router.patch(
  "/:id/status",
  authenticate,
  authorizeRoles([SUPERUSER, APPOWNER]),
  updateExtensionRequestStatus,
  extensionRequests.updateExtensionRequestStatus
);

export default router;
