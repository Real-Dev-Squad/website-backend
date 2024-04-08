import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
import usersStatusController from "../controllers/usersStatus";
import { validateUsersStatus } from "../middlewares/validators/usersStatus";
import { authorizeOwnUserIdParamOrSuperUser } from "../middlewares/authorizeOwnOrSuperUser";
import { authorizeAndAuthenticate } from "../middlewares/authorizeUsersAndService";
const ROLES = require("../constants/roles");
const { Services } = require("../constants/bot");

router.get("/:userId", usersStatusController.getUserStatus);
router.patch("/:userId", authenticate, authorizeOwnUserIdParamOrSuperUser, validateUsersStatus, usersStatusController.updateUserStatus);
router.patch("/update", authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]), usersStatusController.updateAllUserStatus);
// router.patch(
//   "/batch",
//   authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]),
//   validateMassUpdate,
//   batchUpdateUsersStatus
// );
module.exports = router;
