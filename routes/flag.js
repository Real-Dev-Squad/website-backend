const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { authorizeUser } = require("../middlewares/authorization");
const flagController = require("../controllers/flag");

router.post("/add", authenticate, authorizeUser("superUser"), flagController.addFlag);

module.exports = router;
