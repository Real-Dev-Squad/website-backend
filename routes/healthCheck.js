const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const health = require("../controllers/health");

router.get("/", health.healthCheck);
router.get("/v2", authenticate, health.healthCheck);

module.exports = router;
