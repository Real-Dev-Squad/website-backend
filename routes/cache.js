const express = require("express");
const router = express.Router();
const cache = require("../controllers/cache");
const authenticate = require("../middlewares/authenticate");

router.get("/", authenticate, cache.fetchPurgedCacheMetadata);

module.exports = router;
