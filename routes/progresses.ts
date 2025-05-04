import express from "express";
import authenticate from "../middlewares/authenticate.js";
import {
  validateCreateProgressRecords,
  validateGetProgressRecordsQuery,
  validateGetRangeProgressRecordsParams,
  validateGetDayProgressParams,
} from "../middlewares/validators/progresses.js";
import {
  createProgress,
  getProgress,
  getProgressRangeData,
  getProgressBydDateController,
} from "../controllers/progresses.js";

const router = express.Router();
router.post("/", authenticate, validateCreateProgressRecords, createProgress);
router.get("/", validateGetProgressRecordsQuery, getProgress);
router.get("/:type/:typeId/date/:date", validateGetDayProgressParams, getProgressBydDateController);
router.get("/range", validateGetRangeProgressRecordsParams, getProgressRangeData);

export default  router;
