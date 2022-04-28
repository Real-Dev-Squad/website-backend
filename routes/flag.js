const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { authorizeUser } = require("../middlewares/authorization");
const flagController = require("../controllers/flag");
const { addFeatureFlagValidator } = require("../middlewares/validators/flag");

router.post("/add", authenticate, authorizeUser("superUser"), addFeatureFlagValidator, flagController.addFlag);

router.get("/flag", authenticate, authorizeUser("superUser"), addFeatureFlagValidator, flagController.fetchFlags);

module.exports = router;
