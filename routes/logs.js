const express = require("express");
const router = express.Router();
const logs = require("../controllers/logs");

router.get("/:type", logs.fetch);

module.exports = router;
