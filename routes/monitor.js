import express from "express";
import { ROLES } from "../constants/roles.js";
import {
  createTrackedProgressController,
  getTrackedProgressController,
  updateTrackedProgressController,
} from "../controllers/monitor.js";
import authenticate from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import {
  validateCreateTrackedProgressRecord,
  validateGetTrackedProgressQueryParams,
  validateUpdateTrackedProgress,
} from "../middlewares/validators/monitor.js";

const router = express.Router();
const { SUPERUSER } = ROLES;

router.post(
  "/",
  authenticate,
  authorizeRoles([SUPERUSER]),
  validateCreateTrackedProgressRecord,
  createTrackedProgressController
);

router.patch(
  "/:type/:typeId",
  authenticate,
  authorizeRoles([SUPERUSER]),
  validateUpdateTrackedProgress,
  updateTrackedProgressController
);

router.get("/", validateGetTrackedProgressQueryParams, getTrackedProgressController);

export default router;
