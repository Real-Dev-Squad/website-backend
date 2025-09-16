import express from "express";
import {authorizeRoles} from "../middlewares/authorizeRoles.js";
import { SUPERUSER } from "../constants/roles.js";
import authenticate from "../middlewares/authenticate.js";
import { oooRoleCheckMiddleware } from "../middlewares/oooRoleCheckMiddleware.js";
import { 
    createRequestsMiddleware, 
    updateRequestsMiddleware,
    getRequestsMiddleware, 
    updateRequestValidator
} from "../middlewares/validators/requests.js";
import { 
    createRequestController , 
    updateRequestController, 
    getRequestsController,
    updateRequestBeforeAcknowledgedController
} from "../controllers/requests.js";
import { skipAuthenticateForOnboardingExtensionRequest } from "../middlewares/skipAuthenticateForOnboardingExtension.js";
import { verifyDiscordBot } from "../middlewares/authorizeBot.js";

const router = express.Router();

router.get("/", getRequestsMiddleware, getRequestsController);
router.post("/", skipAuthenticateForOnboardingExtensionRequest(authenticate, verifyDiscordBot), createRequestsMiddleware, createRequestController);
router.put("/:id",authenticate, authorizeRoles([SUPERUSER]), updateRequestsMiddleware, updateRequestController);
router.patch("/:id", authenticate, oooRoleCheckMiddleware, updateRequestValidator, updateRequestBeforeAcknowledgedController);
export default router;

