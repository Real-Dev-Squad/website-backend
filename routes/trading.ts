import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
import { newTrade } from "../middlewares/validators/trading";
import { trade } from "../controllers/trading";

router.post("/stock/new/self", authenticate, newTrade, trade);

module.exports = router;
