const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { authorizeUser } = require("../middlewares/authorization");
const { validateFeatureFlag, updateFeatureFlags } = require("../middlewares/validators/featureFlags");
const featureFlag = require("../controllers/featureFlags");

router.get("/", featureFlag.getFeatureFlags);

router.post("/", authenticate, authorizeUser("appOwner"), validateFeatureFlag, featureFlag.addFeatureFlag);

router.patch("/:id", authenticate, authorizeUser("appOwner"), updateFeatureFlags, featureFlag.updateFeatureFlag);

router.delete("/:id", authenticate, authorizeUser("appOwner"), featureFlag.deleteFeatureFlag);

module.exports = router;
