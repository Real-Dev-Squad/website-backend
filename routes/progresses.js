const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const {
  validateCreateProgressRecords,
  validateGetProgressRecordsQuery,
  validateGetRangeProgressRecordsParams,
} = require("../middlewares/validators/progresses");
const { createProgress, getProgress, getProgressRangeData } = require("../controllers/progresses");

router.post("/", authenticate, validateCreateProgressRecords, createProgress);
router.get("/", validateGetProgressRecordsQuery, getProgress);
router.get("/range", validateGetRangeProgressRecordsParams, getProgressRangeData);

module.exports = router;
