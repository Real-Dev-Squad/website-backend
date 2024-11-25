import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
const authorizeRoles = require("../middlewares/authorizeRoles");
import { createFeatureFlag, getAllFeatureFlags, getFeatureFlagById, updateFeatureFlag} from "../controllers/featureFlags";
const { SUPERUSER } = require("../constants/roles");
import { validateUpdateFeatureFlag } from '../middlewares/validators/featureFlag';

router.get("/getAllFeatureFlags", authenticate, getAllFeatureFlags);
router.get("/getFeatureFlag/:flagId", authenticate, getFeatureFlagById);
router.post('/createFeatureFlag', authenticate, authorizeRoles([SUPERUSER]), createFeatureFlag);
router.patch('/updateFeatureFlag/:flagId', authenticate, authorizeRoles([SUPERUSER]), validateUpdateFeatureFlag, updateFeatureFlag);

module.exports = router;
