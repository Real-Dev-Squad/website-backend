import express from "express";
const router = express.Router();
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
import authenticate from "../middlewares/authenticate";
import {
    createRequestsMiddleware,
    updateRequestsMiddleware,
    getRequestsMiddleware,
    updateRequestValidator
} from "../middlewares/validators/requests";
import {
    createRequestController,
    updateRequestController,
    getRequestsController,
    updateRequestBeforeAcknowledgedController,
    migrateRequestStateToStatus
} from "../controllers/requests";
import { skipAuthenticateForOnboardingExtensionRequest } from "../middlewares/skipAuthenticateForOnboardingExtension";
import { verifyDiscordBot } from "../middlewares/authorizeBot";
import { updateRequestStateToStatus } from "../models/requests";


router.get("/", getRequestsMiddleware, getRequestsController);
router.post("/", skipAuthenticateForOnboardingExtensionRequest(authenticate, verifyDiscordBot), createRequestsMiddleware, createRequestController);
router.put("/:id", authenticate, authorizeRoles([SUPERUSER]), updateRequestsMiddleware, updateRequestController);
router.patch("/:id", authenticate, updateRequestValidator, updateRequestBeforeAcknowledgedController);
router.post("/migrations", authenticate, authorizeRoles([SUPERUSER]), migrateRequestStateToStatus);
module.exports = router

