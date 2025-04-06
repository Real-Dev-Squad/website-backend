import express from "express";
import authenticate from "../middlewares/authenticate.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { addNewStock, fetchStocks, getSelfStocks, getUserStocks } from "../controllers/stocks.js";
import { createStock } from "../middlewares/validators/stocks.js";
import { SUPERUSER } from "../constants/roles.js";
import { devFlagMiddleware } from "../middlewares/devFlag.js";
import { userAuthorization } from "../middlewares/userAuthorization.js";

const router = express.Router();

router.get("/", fetchStocks);
router.post("/", authenticate, authorizeRoles([SUPERUSER]), createStock, addNewStock);
router.get("/user/self", authenticate, getSelfStocks); // this route will soon be deprecated, please use `/stocks/:userId` route.
router.get("/:userId", devFlagMiddleware, authenticate, userAuthorization, getUserStocks);

export default router;
