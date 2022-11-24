const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const extensionRequests = require("../controllers/extensionRequests");

router.get("/self", authenticate, extensionRequests.getSelfExtensionRequests);
router.get("/self:taskId", authenticate, extensionRequests.getSelfExtensionRequests);
