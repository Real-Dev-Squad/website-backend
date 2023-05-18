const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
const {
  createTrackedProgressController,
  updateTrackedProgressController,
} = require("../controllers/trackedProgresses");
const {
  validateCreateTrackedProgressRecords,
  validateUpdateTrackedProgress,
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

module.exports = router;
