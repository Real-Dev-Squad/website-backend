import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
import usersStatusController from "../controllers/usersStatus";
import { validateUsersStatus } from "../middlewares/validators/usersStatus";
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");

router.get("/self", authenticate, usersStatusController.getUserStatus);
router.get("/:userId", usersStatusController.getUserStatus);
router.patch("/self", authenticate, validateUsersStatus, usersStatusController.updateUserStatus)
router.patch("/:userId", authenticate, authorizeRoles([SUPERUSER]), validateUsersStatus, usersStatusController.updateUserStatus);

module.exports = router;
