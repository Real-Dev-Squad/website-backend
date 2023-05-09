const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const {
  validateProgresses,
  validateGetProgressesQueryParams,
  validateGetRangeProgressesQueryParams,
} = require("../middlewares/validators/progresses");
const { createProgress, getProgress, getProgressRangeData } = require("../controllers/progresses");

router.post("/", authenticate, validateProgresses, createProgress);
router.get("/", validateGetProgressesQueryParams, getProgress);
router.get("/range", validateGetRangeProgressesQueryParams, getProgressRangeData);

module.exports = router;
