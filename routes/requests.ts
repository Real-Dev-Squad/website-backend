import express from "express";
import {authorizeRoles} from "../middlewares/authorizeRoles";
import { SUPERUSER } from "../constants/roles";
import authenticate from "../middlewares/authenticate";
import { oooRoleCheckMiddleware } from "../middlewares/oooRoleCheckMiddleware";
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

