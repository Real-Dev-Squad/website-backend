import express from "express";
import authenticate from "../middlewares/authenticate.js";
import { fcmTokenController } from "../controllers/fcmToken.js";
import { fcmTokenValidator } from "../middlewares/validators/fcmToken.js";

const router = express.Router();

router.post("/", authenticate, fcmTokenValidator.validateFcmToken, fcmTokenController);

export default router;
