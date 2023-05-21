const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const {
  validateCreateProgressRecords,
  validateGetProgressRecordsQuery,
  validateGetRangeProgressRecordsParams,
  validateGetDayProgressParams,
} = require("../middlewares/validators/progresses");
const {
  createProgress,
  getProgress,
  getProgressRangeData,
  getProgressBydDateController,
} = require("../controllers/progresses");

router.post("/", authenticate, validateCreateProgressRecords, createProgress);
router.get("/", validateGetProgressRecordsQuery, getProgress);
router.get("/:type/:typeId/date/:date", validateGetDayProgressParams, getProgressBydDateController);
router.get("/range", validateGetRangeProgressRecordsParams, getProgressRangeData);

module.exports = router;
