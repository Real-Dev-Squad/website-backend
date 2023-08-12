const express = require("express");
const { SUPERUSER } = require("../constants/roles");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const applications = require("../controllers/applications.ts");
const authorizeOwnOrSuperUser = require("../middlewares/authrizeOwnOrSuperUser");
const applicationValidator = require("../middlewares/validators/application");

const router = express.Router();

router.get(
  "/",
  authenticate,
  authorizeOwnOrSuperUser,
  applicationValidator.validateApplicationData,
  applications.getAllOrUserApplication
);
router.post("/", authenticate, applications.addApplication);
router.patch("/:applicationId", authenticate, authorizeRoles([SUPERUSER]), applications.updateApplication);

module.exports = router;
