import express from "express";
import * as profileDiffs from "../controllers/profileDiffs.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import authenticate from "../middlewares/authenticate.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();
const { SUPERUSER } = ROLES;

router.get("/", authenticate, authorizeRoles([SUPERUSER]), profileDiffs.getProfileDiffs);
router.get("/:id", authenticate, authorizeRoles([SUPERUSER]), profileDiffs.getProfileDiff);

export default router;
