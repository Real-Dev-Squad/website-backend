const express = require("express");
const router = express.Router();
const caches = require("../controllers/caches");
const authenticate = require("../middlewares/authenticate");

router.get("/", authenticate, caches.fetchPurgedCacheMetadata);

module.exports = router;
