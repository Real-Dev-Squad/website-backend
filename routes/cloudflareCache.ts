import express from "express";
const router = express.Router();
import cloudflareCache from "../controllers/cloudflareCache";
import authenticate from "../middlewares/authenticate";

router.get("/", authenticate, cloudflareCache.fetchPurgedCacheMetadata);
router.post("/", authenticate, cloudflareCache.purgeCache);

module.exports = router;
