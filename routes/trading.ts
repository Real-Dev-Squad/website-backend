import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
import { newTrade } from "../middlewares/validators/trading";
import { trade } from "../controllers/trading";
import { devFlagMiddleware } from "../middlewares/devFlag";
import { userAuthorization } from "../middlewares/userAuthorization";

router.post("/stock/new/self", authenticate, newTrade, trade); // this route is being deprecated, please use new available route `/stock/new/:userId`
router.post("/stock/new/:userId", devFlagMiddleware, authenticate, userAuthorization, newTrade, trade);

module.exports = router;
