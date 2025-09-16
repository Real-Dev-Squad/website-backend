// @ts-nocheck

import express from "express";
import { ROLES } from "../constants/roles.js";
import authenticate from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { getAllOrUserApplication, addNewApplication, updateApplicationStatus } from "../controllers/applications.js";
import { authorizeOwnOrSuperUser } from "../middlewares/authorizeOwnOrSuperUser.js";
import applicationValidator from "../middlewares/validators/application.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeOwnOrSuperUser,
  applicationValidator.validateApplicationQueryParam,
  getAllOrUserApplication
);
// router.get("/:applicationId", authenticate, authorizeRoles([ROLES.SUPERUSER]), getApplicationById);
router.post("/", authenticate, applicationValidator.validateApplicationData, addNewApplication);
router.patch(
  "/:applicationId",
  authenticate,
  authorizeRoles([ROLES.SUPERUSER]),
  applicationValidator.validateApplicationUpdateData,
  updateApplicationStatus
);

export default router;
