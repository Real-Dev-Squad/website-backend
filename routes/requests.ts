import express from "express";
const router = express.Router();
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");

import authenticate from "../middlewares/authenticate";
import { createRequestsMiddleware,updateRequestsMiddleware,getRequestsMiddleware } from "../middlewares/validators/requests";
import { createRequestController , updateRequestController, getRequestsController, updateRequestBeforeApprovalController, } from "../controllers/requests";
import { updateRequestValidator } from "../middlewares/validators/updateRequestValidator";

router.get("/", getRequestsMiddleware, getRequestsController);
router.post("/",authenticate, createRequestsMiddleware, createRequestController);
router.put("/:id",authenticate, authorizeRoles([SUPERUSER]), updateRequestsMiddleware, updateRequestController);
router.patch("/:id", authenticate, updateRequestValidator, updateRequestBeforeApprovalController);
module.exports = router;

