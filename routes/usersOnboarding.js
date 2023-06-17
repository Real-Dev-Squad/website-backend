const express = require("express");
const { getUsersWithOnboardingState } = require("../controllers/usersOnboarding");
const router = express.Router();

router.get("/", getUsersWithOnboardingState);

module.exports = router;
