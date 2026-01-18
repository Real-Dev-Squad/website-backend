const express = require("express");
const {
  deleteUserStatus,
  getUserStatus,
  updateUserStatuses,
  updateAllUserStatus,
  batchUpdateUsersStatus,
  getUserStatusControllers,
  updateUserStatusController,
} = require("../controllers/userStatus");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
const {
  validateUserStatus,
  validateMassUpdate,
  validateGetQueryParams,
  validateUserStatusSelf,
} = require("../middlewares/validators/userStatus");
const { authorizeAndAuthenticate } = require("../middlewares/authorizeUsersAndService");
const ROLES = require("../constants/roles");
const { Services } = require("../constants/bot");

router.get("/", validateGetQueryParams, getUserStatusControllers);
router.get("/self", authenticate, getUserStatus);
router.get("/:userId", getUserStatus);
router.patch("/self", authenticate, validateUserStatusSelf, updateUserStatusController); // this route is being deprecated, please use /users/status/:userId PATCH endpoint instead.
router.patch("/update", authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]), updateAllUserStatus);
router.patch(
  "/batch",
  authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]),
  validateMassUpdate,
  batchUpdateUsersStatus
);
router.patch("/:userId", authenticate, validateUserStatus, updateUserStatuses);
router.delete("/:userId", authenticate, authorizeRoles([SUPERUSER]), deleteUserStatus);

module.exports = router;
