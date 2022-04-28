const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { authorizeUser } = require("../middlewares/authorization");
const flagController = require("../controllers/flag");
const { addFeatureFlag } = require("../middlewares/validators/flag");
const { SUPER_USER } = require("../constants/roles");

router.post("/add", authenticate, authorizeUser(SUPER_USER), addFeatureFlag, flagController.addFlag);

module.exports = router;
