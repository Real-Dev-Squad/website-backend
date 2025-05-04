import express from "express";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";
import authenticate from "../middlewares/authenticate.js";
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
router.put("/:id",authenticate, authorizeRoles([ROLES.SUPERUSER]), updateRequestsMiddleware, updateRequestController);
router.patch("/:id", authenticate, updateRequestValidator, updateRequestBeforeAcknowledgedController);

export default  router;

