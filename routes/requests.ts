import express from "express";
const router = express.Router();
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
import authenticate from "../middlewares/authenticate";
import { oooRoleCheckMiddleware } from "../middlewares/oooRoleCheckMiddleware";
import { 
    createRequestsMiddleware, 
    updateRequestsMiddleware,
    getRequestsMiddleware, 
    updateRequestValidator
} from "../middlewares/validators/requests";
import { 
    createRequestController , 
    updateRequestController, 
    getRequestsController,
    updateRequestBeforeAcknowledgedController
} from "../controllers/requests";
import { skipAuthenticateForOnboardingExtensionRequest } from "../middlewares/skipAuthenticateForOnboardingExtension";
import { verifyDiscordBot } from "../middlewares/authorizeBot";


router.get("/", getRequestsMiddleware, getRequestsController);
router.post("/", skipAuthenticateForOnboardingExtensionRequest(authenticate, verifyDiscordBot), createRequestsMiddleware, createRequestController);
router.put("/:id",authenticate, authorizeRoles([SUPERUSER]), updateRequestsMiddleware, updateRequestController);
router.patch("/:id", authenticate, oooRoleCheckMiddleware, updateRequestValidator, updateRequestBeforeAcknowledgedController);
module.exports = router;

