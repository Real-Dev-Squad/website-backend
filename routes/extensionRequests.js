const express = require("express");
const router = express.Router();
const extensionRequests = require("../controllers/extensionRequests");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER, APPOWNER } = require("../constants/roles");
const { createExtensionRequest, updateExtensionRequest } = require("../middlewares/validators/extensionRequests");

router.post("/", authenticate, createExtensionRequest, extensionRequests.createTaskExtensionRequest);
router.get("/", authenticate, authorizeRoles([SUPERUSER, APPOWNER]), extensionRequests.fetchExtensionRequests);
router.get("/self", authenticate, extensionRequests.getSelfExtensionRequests);
router.get("/:id", authenticate, authorizeRoles([SUPERUSER, APPOWNER]), extensionRequests.getExtensionRequest);
router.patch(
  "/:id",
  authenticate,
  authorizeRoles([SUPERUSER, APPOWNER]),
  updateExtensionRequest,
  extensionRequests.updateExtensionRequest
);

module.exports = router;
