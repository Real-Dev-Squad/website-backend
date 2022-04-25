const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { authorizeUser } = require("../middlewares/authorization");
const flagController = require("../controllers/flag");
const { addFeatureFlag } = require("../middlewares/validators/flag");
const superUser = "superUser";

router.post("/add", authenticate, authorizeUser(superUser), addFeatureFlag, flagController.addFlag);

module.exports = router;
