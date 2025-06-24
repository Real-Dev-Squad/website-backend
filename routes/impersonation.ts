import express from "express";
import { createImpersonationRequestValidator, impersonationSessionValidator } from "../middlewares/validators/impersonationRequests";
const router = express.Router();
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
import authenticate from "../middlewares/authenticate";
import { createImpersonationRequestController, impersonationController } from "../controllers/impersonationRequests";

router.post(
  "/requests",
  authenticate,
  authorizeRoles([SUPERUSER]),
  createImpersonationRequestValidator,
  createImpersonationRequestController
);


router.patch("/:id",authenticate,impersonationSessionValidator,impersonationController)

module.exports = router;