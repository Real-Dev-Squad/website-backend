const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { validateProgresses, validateGetProgressesQueryParams } = require("../middlewares/validators/progresses");
const { createProgress, getProgress } = require("../controllers/progresses");

router.post("/", authenticate, validateProgresses, createProgress);
router.get("/", validateGetProgressesQueryParams, getProgress);

module.exports = router;
