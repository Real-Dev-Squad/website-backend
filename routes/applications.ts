// @ts-nocheck

import express from "express";
import { ROLES } from "../constants/roles.js";
import authenticate from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import * as applications from "../controllers/applications.js";
import { authorizeOwnOrSuperUser } from "../middlewares/authorizeOwnOrSuperUser.js";
import * as applicationValidator from "../middlewares/validators/application.js";

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeOwnOrSuperUser,
  applicationValidator.validateApplicationQueryParam,
  applications.getAllOrUserApplication
);
router.get("/:applicationId", authenticate, authorizeRoles([ROLES.SUPERUSER]), applications.getApplicationById);
router.post("/", authenticate, applicationValidator.validateApplicationData, applications.addApplication);
router.patch(
  "/:applicationId",
  authenticate,
  authorizeRoles([ROLES.SUPERUSER]),
  applicationValidator.validateApplicationUpdateData,
  applications.updateApplication
);

export default router;
