const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
const {
  createTrackedProgressController,
  updateTrackedProgressController,
  getTrackedProgressController,
} = require("../controllers/monitor");
const {
  validateCreateTrackedProgressRecord,
  validateUpdateTrackedProgress,
  validateGetTrackedProgressQueryParams,
} = require("../middlewares/validators/monitor");

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

module.exports = router;
