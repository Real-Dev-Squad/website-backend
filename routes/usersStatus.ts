import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
import usersStatusController from "../controllers/usersStatus";
import { validateUsersStatus } from "../middlewares/validators/usersStatus";
import { authorizeOwnUserIdParamOrSuperUser } from "../middlewares/authorizeOwnOrSuperUser";

router.get("/:userId", usersStatusController.getUserStatus);
router.patch("/:userId", authenticate, authorizeOwnUserIdParamOrSuperUser, validateUsersStatus, usersStatusController.updateUserStatus);

module.exports = router;
