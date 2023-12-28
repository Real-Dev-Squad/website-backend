import { removePrivileges, updateRoles } from "../controllers/staging";
import { validateRevokePrivileges, validateUserRoles } from "../middlewares/validators/staging";

import authenticate from "../middlewares/authenticate";
import express from "express";

const router = express.Router();

router.patch("/user", validateUserRoles, authenticate, updateRoles);
router.post("/users/privileges", validateRevokePrivileges, removePrivileges);

module.exports = router;
