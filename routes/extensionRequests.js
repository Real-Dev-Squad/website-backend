const express = require("express");
const router = express.Router();
const extensionRequests = require("../controllers/extensionRequests");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER, APPOWNER } = require("../constants/roles");
const { createExtensionRequest } = require("../middlewares/validators/extensionRequests");

router.post("/", authenticate, createExtensionRequest, extensionRequests.createETAExtension);
router.get("/", authenticate, authorizeRoles([SUPERUSER, APPOWNER]), extensionRequests.fetchExtensionRequests);
router.get("/:id", authenticate, authorizeRoles([SUPERUSER, APPOWNER]), extensionRequests.getExtensionRequest);

module.exports = router;
