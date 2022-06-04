const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { authorizeUser } = require("../middlewares/authorization");
const flagController = require("../controllers/flag");
const { addFeatureFlagValidator } = require("../middlewares/validators/flag");
const { LEGACY_ROLES } = require("../constants/roles");

router.post(
  "/add",
  authenticate,
  authorizeUser(LEGACY_ROLES.SUPER_USER),
  addFeatureFlagValidator,
  flagController.addFlag
);

module.exports = router;
