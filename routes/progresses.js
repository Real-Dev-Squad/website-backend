const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { validateProgresses } = require("../middlewares/validators/progresses");

router.post("/", authenticate, validateProgresses);

module.exports = router;
