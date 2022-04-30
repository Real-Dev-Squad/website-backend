const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { authorizeUser } = require("../middlewares/authorization");
const flagController = require("../controllers/flag");
const { addFeatureFlagValidator } = require("../middlewares/validators/flag");

router.get("/", authenticate, authorizeUser("superUser"), flagController.fetchFlags);
router.post("/add", authenticate, authorizeUser("superUser"), addFeatureFlagValidator, flagController.addFlag);

module.exports = router;
