import express from "express";
import {
  deleteUserStatus,
  getUserStatus,
  updateUserStatuses,
  updateAllUserStatus,
  batchUpdateUsersStatus,
  getUserStatusControllers,
  updateUserStatusController,
} from "../controllers/userStatus.js";
import authenticate from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
  validateUserStatus,
  validateMassUpdate,
  validateGetQueryParams,
} from "../middlewares/validators/userStatus.js";
import { authorizeAndAuthenticate } from "../middlewares/authorizeUsersAndService.js";
import { ROLES } from "../constants/roles.js";
import { Services } from "../constants/bot.js";

const router = express.Router();

router.get("/", validateGetQueryParams, getUserStatusControllers);
router.get("/self", authenticate, getUserStatus);
router.get("/:userId", getUserStatus);
router.patch("/self", authenticate, validateUserStatus, updateUserStatusController); // this route is being deprecated, please use /users/status/:userId PATCH endpoint instead.
router.patch("/update", authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]), updateAllUserStatus);
router.patch(
  "/batch",
  authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]),
  validateMassUpdate,
  batchUpdateUsersStatus
);
router.patch("/:userId", authenticate, validateUserStatus, updateUserStatuses);
router.delete("/:userId", authenticate, authorizeRoles([ROLES.SUPERUSER]), deleteUserStatus);

export default router;
