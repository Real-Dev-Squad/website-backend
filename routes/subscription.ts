import express from "express";
import authenticate from "../middlewares/authenticate";
import { subscribe, unsubscribe, sendEmail } from "../controllers/subscription";
import { validateSubscribe } from "../middlewares/validators/subscription";
const authorizeRoles = require("../middlewares/authorizeRoles");
const router = express.Router();
const { SUPERUSER } = require("../constants/roles");
import { devFlagMiddleware } from "../middlewares/devFlag";

router.post("/", authenticate, devFlagMiddleware, validateSubscribe, subscribe);
router.patch("/", authenticate,devFlagMiddleware, unsubscribe);
router.get("/notify", authenticate, devFlagMiddleware, authorizeRoles([SUPERUSER]), sendEmail);
module.exports = router;
