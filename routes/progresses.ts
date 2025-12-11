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
import { disableRoute } from "../middlewares/shortCircuit";
const router = express.Router();
// DISABLE ROUTE FOR NOW as there is a security issue to be resolved
router.post("/", authenticate, disableRoute, validateCreateProgressRecords, createProgress);
router.get("/", validateGetProgressRecordsQuery, getProgress);
router.get("/:type/:typeId/date/:date", validateGetDayProgressParams, getProgressBydDateController);
router.get("/range", validateGetRangeProgressRecordsParams, getProgressRangeData);

module.exports = router;
