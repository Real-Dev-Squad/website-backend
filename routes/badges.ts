import express from "express";
import authenticate from "../middlewares/authenticate.js";
import { assignOrRemoveBadges, createBadge } from "../middlewares/validators/badges.js";
import { upload } from "../utils/multer.js";
import * as badgesController from "../controllers/badges.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();

router.get("/", badgesController.getBadges);
// INFO: upload(muter-middelware) looks for form-data key named file
router.post(
  "/",
  authenticate,
  authorizeRoles([ROLES.SUPERUSER]),
  upload.single("file"),
  createBadge,
  badgesController.createBadge
);
router.post(
  "/assign",
  authenticate,
  authorizeRoles([ROLES.SUPERUSER]),
  assignOrRemoveBadges,
  badgesController.createBadge
);
router.delete(
  "/remove",
  authenticate,
  authorizeRoles([ROLES.SUPERUSER]),
  assignOrRemoveBadges,
  badgesController.deleteBadge
);

export default router;
