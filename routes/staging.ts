import express from "express";

import { removePrivileges, updateRoles } from "../controllers/staging.js";
import { validateRevokePrivileges, validateUserRoles } from "../middlewares/validators/staging.js";
import authenticate from "../middlewares/authenticate.js";

const router = express.Router();

router.patch("/user", validateUserRoles, authenticate, updateRoles);
router.post("/users/privileges", validateRevokePrivileges, removePrivileges);

export default  router;
