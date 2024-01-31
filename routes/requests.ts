import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
import { createRequestsMiddleware } from "../middlewares/validators/requests";
import { createRequestController } from "../controllers/requests";

router.post("/",authenticate, createRequestsMiddleware, createRequestController);
module.exports = router;
