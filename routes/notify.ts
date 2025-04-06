import express from "express";
const router = express.Router();

import authenticate from "../middlewares/authenticate";
import { notifyController } from "../controllers/notify";
import { notifyValidator } from "../middlewares/validators/notify";

router.post("/", authenticate, notifyValidator, notifyController);
export default  router;
