const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
const { createTrackedProgressController } = require("../controllers/trackedProgresses");
const { validateCreateTrackedProgressRecords } = require("../middlewares/validators/trackedProgresses");

router.post(
  "/",
  authenticate,
  authorizeRoles([SUPERUSER]),
  validateCreateTrackedProgressRecords,
  createTrackedProgressController
);

module.exports = router;
