const express = require("express");
const { SUPERUSER } = require("../constants/roles");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const applications = require("../controllers/applications");
const authorizeOwnOrSuperUser = require("../middlewares/authorizeOwnOrSuperUser");
const applicationValidator = require("../middlewares/validators/application");

const router = express.Router();

router.get("/", authenticate, authorizeOwnOrSuperUser, applications.getAllOrUserApplication);
router.get("/:applicationId", authenticate, authorizeRoles([SUPERUSER]), applications.getApplicationById);
router.post("/", authenticate, applicationValidator.validateApplicationData, applications.addApplication);
router.patch(
  "/:applicationId",
  authenticate,
  applicationValidator.validateApplicationUpdateData,
  authorizeRoles([SUPERUSER]),
  applications.updateApplication
);

module.exports = router;
