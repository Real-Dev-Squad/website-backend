const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { validateProgresses } = require("../middlewares/validators/progresses");
const { addProgresses } = require("../controllers/progresses");

router.post("/", authenticate, validateProgresses, addProgresses);

module.exports = router;
