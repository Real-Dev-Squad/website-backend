import express from "express";
const router = express.Router();
import cloudflareCache from "../controllers/cloudflareCache.js";
import authenticate from "../middlewares/authenticate.js";

router.get("/", authenticate, cloudflareCache.fetchPurgedCacheMetadata);
router.post("/", authenticate, cloudflareCache.purgeCache);

export default  router;
