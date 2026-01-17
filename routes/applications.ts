const express = require("express");
const { SUPERUSER } = require("../constants/roles");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const applications = require("../controllers/applications");
const { authorizeOwnOrSuperUser } = require("../middlewares/authorizeOwnOrSuperUser");
const applicationValidator = require("../middlewares/validators/application");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeOwnOrSuperUser,
  applicationValidator.validateApplicationQueryParam,
  applications.getAllOrUserApplication
);
router.get("/:applicationId", authenticate, authorizeRoles([SUPERUSER]), applications.getApplicationById);
router.post("/", authenticate, applicationValidator.validateApplicationData, applications.addApplication);
router.patch(
  "/:applicationId/feedback",
  authenticate,
  authorizeRoles([SUPERUSER]),
  applicationValidator.validateApplicationUpdateData,
  applications.submitApplicationFeedback
);
router.patch("/:applicationId/nudge", authenticate, applications.nudgeApplication);

module.exports = router;
