import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
const authorizeRoles = require("../middlewares/authorizeRoles");
import { getAllFeatureFlags, createFeatureFlag, updateFeatureFlag } from "../controllers/featureFlags";
const { SUPERUSER } = require("../constants/roles");

router.get("/getAllFeatureFlags", authenticate, getAllFeatureFlags);
router.post('/createFeatureFlag', authenticate, authorizeRoles(SUPERUSER), createFeatureFlag);
router.patch('/updateFeatureFlag/:flagId', authenticate, authorizeRoles(SUPERUSER), updateFeatureFlag);

module.exports = router;
