import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate.js";
import { newTrade } from "../middlewares/validators/trading.js";
import { trade } from "../controllers/trading.js";
import { devFlagMiddleware } from "../middlewares/devFlag.js";
import { userAuthorization } from "../middlewares/userAuthorization.js";

router.post("/stock/new/self", authenticate, newTrade, trade); // this route is being deprecated, please use new available route `/stock/new/:userId`
router.post("/stock/new/:userId", devFlagMiddleware, authenticate, userAuthorization, newTrade, trade);

export default  router;
