import express from "express";
const router = express.Router();
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");

import authenticate from "../middlewares/authenticate";
import { createRequestsMiddleware,updateRequestsMiddleware,getRequestsMiddleware } from "../middlewares/validators/requests";
import { createRequestController , updateRequestController, getRequestsController} from "../controllers/requests";
import { skipAuthenticateForOnboardingExtensionRequest } from "../middlewares/skipAuthenticateForOnboardingExtension";
import { verifyDiscordBot } from "../middlewares/authorizeBot";

router.get("/", getRequestsMiddleware, getRequestsController);
router.post("/", skipAuthenticateForOnboardingExtensionRequest(authenticate, verifyDiscordBot), createRequestsMiddleware, createRequestController);
router.put("/:id",authenticate, authorizeRoles([SUPERUSER]), updateRequestsMiddleware, updateRequestController);
module.exports = router;
