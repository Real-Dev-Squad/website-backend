const express = require("express");
const { SUPERUSER } = require("../constants/roles");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const applications = require("../controllers/applications");

const router = express.Router();

router.get("/", authenticate, authorizeRoles([SUPERUSER]), applications.getAllApplications);
router.post("/", authenticate, applications.addApplication);
router.get("/:userId", authenticate, applications.getUserApplication);
router.patch("/:userId", authenticate, authorizeRoles([SUPERUSER]), applications.updateApplication);

module.exports = router;
