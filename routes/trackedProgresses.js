const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
const {
  createTrackedProgressController,
  updateTrackedProgressController,
  getTrackedProgressController,
  getIndividualTrackedProgressController,
} = require("../controllers/trackedProgresses");
const {
  validateCreateTrackedProgressRecords,
  validateUpdateTrackedProgress,
  validateGetTrackedProgress,
  validateGetIndividualTrackedProgress,
} = require("../middlewares/validators/trackedProgresses");

router.post(
  "/",
  authenticate,
  authorizeRoles([SUPERUSER]),
  validateCreateTrackedProgressRecords,
  createTrackedProgressController
);

router.patch(
  "/:type/:typeId",
  authenticate,
  authorizeRoles([SUPERUSER]),
  validateUpdateTrackedProgress,
  updateTrackedProgressController
);

router.get("/", validateGetTrackedProgress, getTrackedProgressController);

router.get("/:type/:typeId", validateGetIndividualTrackedProgress, getIndividualTrackedProgressController);

module.exports = router;
