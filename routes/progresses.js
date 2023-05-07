const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { validateProgresses } = require("../middlewares/validators/progresses");
const { createProgress } = require("../controllers/progresses");

router.post("/", authenticate, validateProgresses, createProgress);

module.exports = router;
