import express from "express";
import { addLevel, deleteLevel, getAllLevels } from "../controllers/levels.js";
import { validateLevelBody } from "../middlewares/validators/levels.js";
import authenticate from "../middlewares/authenticate.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { SUPERUSER } from "../constants/roles.js";

const router = express.Router();

router.get("/", getAllLevels);
router.post("/", authenticate, authorizeRoles([SUPERUSER]), validateLevelBody, addLevel);
router.delete("/:id", authenticate, authorizeRoles([SUPERUSER]), deleteLevel);

export default router;
