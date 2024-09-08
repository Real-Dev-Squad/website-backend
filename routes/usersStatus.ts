import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
import usersStatusController from "../controllers/usersStatus";
import { validateUsersStatus, validateMassUpdate, validateGetQueryParams } from "../middlewares/validators/usersStatus";
import { authorizeOwnUserIdParamOrSuperUser } from "../middlewares/authorizeOwnOrSuperUser";
import { authorizeAndAuthenticate } from "../middlewares/authorizeUsersAndService";
const authorizeRoles = require("../middlewares/authorizeRoles");
const ROLES = require("../constants/roles");
const { Services } = require("../constants/bot");

router.get("/", validateGetQueryParams, usersStatusController.getAllUserStatus);
router.get("/:userId", usersStatusController.getUserStatus);
router.patch(
  "/update",
  authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]),
  usersStatusController.updateAllUserStatus
);
router.patch(
  "/:userId",
  authenticate,
  authorizeOwnUserIdParamOrSuperUser,
  validateUsersStatus,
  usersStatusController.updateUserStatusController
);
router.patch(
  "/batch",
  authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]),
  validateMassUpdate,
  usersStatusController.batchUpdateUsersStatus
);
router.delete("/:userId", authenticate, authorizeRoles([ROLES.SUPERUSER]), usersStatusController.deleteUserStatus);
module.exports = router;