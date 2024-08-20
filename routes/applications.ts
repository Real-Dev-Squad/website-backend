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
  "/:applicationId",
  authenticate,
  authorizeRoles([SUPERUSER]),
  applicationValidator.validateApplicationUpdateData,
  applications.updateApplication
);
router.patch("/batch/update", authenticate, authorizeRoles([SUPERUSER]), applications.batchUpdateeApplications);
router.patch("/batch/applicant-status-update", authenticate, authorizeRoles([SUPERUSER]), applications.batchUpdateApplications);

module.exports = router;
