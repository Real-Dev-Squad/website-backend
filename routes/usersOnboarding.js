const express = require("express");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
const { getUsersWithOnboardingState } = require("../controllers/usersOnboarding");
const router = express.Router();

router.get("/", authenticate, authorizeRoles([SUPERUSER]), getUsersWithOnboardingState);

module.exports = router;
