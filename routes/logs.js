const express = require("express");
const router = express.Router();
const logs = require("../controllers/logs");
const authenticate = require("../middlewares/authenticate");
const { authorizeUser } = require("../middlewares/authorization");

router.get("/:type", authenticate, authorizeUser("superUser"), logs.fetch);

module.exports = router;
