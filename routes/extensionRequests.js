const express = require("express");
const router = express.Router();
const extensionRequests = require("../controllers/extensionRequests");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER, APPOWNER } = require("../constants/roles");
const {
  createExtensionRequest,
  updateExtensionRequest,
  updateExtensionRequestStatus,
  getExtensionRequestsValidator,
} = require("../middlewares/validators/extensionRequests");
const skipAuthorizeRolesUnderFF = require("../middlewares/skipAuthorizeRolesWrapper");
const { userAuthorization } = require("../middlewares/userAuthorization");
const { devFlagMiddleware } = require("../middlewares/devFlag");

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

module.exports = router;
