import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
const authorizeRoles = require("../middlewares/authorizeRoles");
import { createFeatureFlag, getAllFeatureFlags, getFeatureFlagById } from "../controllers/featureFlags";
const { SUPERUSER } = require("../constants/roles");
import { validateCreateFeatureFlag } from '../middlewares/validators/featureFlag';

router.get("/getAllFeatureFlags", authenticate, getAllFeatureFlags);
router.get("/getFeatureFlag/:flagId", authenticate, getFeatureFlagById);
router.post('/createFeatureFlag', authenticate, authorizeRoles([SUPERUSER]), validateCreateFeatureFlag, createFeatureFlag);

module.exports = router;