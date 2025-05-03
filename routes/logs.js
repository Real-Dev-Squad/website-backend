import express from "express";
import { fetchAllLogs, fetchLogs } from "../controllers/logs.js";
import authenticate from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();
const { SUPERUSER } = ROLES;

router.get("/:type", authenticate, authorizeRoles([SUPERUSER]), fetchLogs);
router.get("/", authenticate, authorizeRoles([SUPERUSER]), fetchAllLogs);

export default router;
