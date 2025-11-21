import express from "express";
import authenticate from "../middlewares/authenticate";
import {
  validateCreateProgressRecords,
  validateGetProgressRecordsQuery,
  validateGetRangeProgressRecordsParams,
  validateGetDayProgressParams,
  validateBulkCreateProgressRecords,
} from "../middlewares/validators/progresses";
import {
  createProgress,
  getProgress,
  getProgressRangeData,
  getProgressBydDateController,
  createBulkProgress,
} from "../controllers/progresses";
const router = express.Router();
// Create a single progress record
router.post("/", authenticate, validateCreateProgressRecords, createProgress);

// Create multiple progress records in bulk
router.post("/bulk", authenticate, validateBulkCreateProgressRecords, createBulkProgress);

// Get progress records with optional filtering
router.get("/", validateGetProgressRecordsQuery, getProgress);

// Get progress for a specific date
router.get("/:type/:typeId/date/:date", validateGetDayProgressParams, getProgressBydDateController);

// Get progress records for a date range
router.get("/range", validateGetRangeProgressRecordsParams, getProgressRangeData);

module.exports = router;
