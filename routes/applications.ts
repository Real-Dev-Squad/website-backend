const express = require("express");
const { SUPERUSER } = require("../constants/roles");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const applications = require("../controllers/applications.ts");

const router = express.Router();

router.get("/", authenticate, authorizeRoles([SUPERUSER]), applications.getAllOrUserApplication);
router.post("/", authenticate, applications.addApplication);
router.patch("/:applicationId", authenticate, authorizeRoles([SUPERUSER]), applications.updateApplication);

module.exports = router;
