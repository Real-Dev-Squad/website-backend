import express from "express";
const router = express.Router();
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
import authenticate from "../middlewares/authenticate";
import { createImpersonationRequestValidator } from "../middlewares/validators/impersonationRequests";
import { createImpersonationRequestController } from "../controllers/impersonationRequests";


router.post("/requests",authenticate,authorizeRoles([SUPERUSER]),createImpersonationRequestValidator,createImpersonationRequestController);

module.exports = router;