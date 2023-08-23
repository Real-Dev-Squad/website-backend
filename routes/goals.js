const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const goals = require("../controllers/goals");

router.post("/token", authenticate, goals.getGoalSiteToken);

module.exports = router;
