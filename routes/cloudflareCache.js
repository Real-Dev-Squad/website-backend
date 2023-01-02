const express = require("express");
const router = express.Router();
const cloudflareCache = require("../controllers/cloudflareCache");
const authenticate = require("../middlewares/authenticate");

router.get("/", authenticate, cloudflareCache.fetchPurgedCacheMetadata);
router.post("/", authenticate, cloudflareCache.purgeCacheByUserOrSuperUser);

module.exports = router;
