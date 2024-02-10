import express from "express";
import authenticate from "../middlewares/authenticate";
import {
  validateCreateProgressRecords,
  validateGetProgressRecordsQuery,
  validateGetRangeProgressRecordsParams,
  validateGetDayProgressParams,
} from "../middlewares/validators/progresses";
import {
  createProgress,
  getProgress,
  getProgressRangeData,
  getProgressBydDateController,
} from "../controllers/progresses";
const router = express.Router();
router.post("/", authenticate, validateCreateProgressRecords, createProgress);
router.get("/", validateGetProgressRecordsQuery, getProgress);
router.get("/:type/:typeId/date/:date", validateGetDayProgressParams, getProgressBydDateController);
router.get("/range", validateGetRangeProgressRecordsParams, getProgressRangeData);

module.exports = router;
