import express from "express";
import logs from "../controllers/logs.js";
import authenticate from "../middlewares/authenticate.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { SUPERUSER } from "../constants/roles.js";

const router = express.Router();

router.get("/", authenticate, authorizeRoles([SUPERUSER]), logs.getLogs);
router.post("/", authenticate, authorizeRoles([SUPERUSER]), logs.addLog);

export default router;
