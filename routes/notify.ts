import express from "express";
const router = express.Router();

import authenticate from "../middlewares/authenticate.js";
import { notifyController } from "../controllers/notify.js";
import { notifyValidator } from "../middlewares/validators/notify.js";

router.post("/", authenticate, notifyValidator, notifyController);
export default  router;
