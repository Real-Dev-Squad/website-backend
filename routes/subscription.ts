import express from "express";
import authenticate from "../middlewares/authenticate";
import { subscribe, unsubscribe, sendEmail } from "../controllers/subscription";
import { validateSubscribe } from "../middlewares/validators/subscription";
const authorizeRoles = require("../middlewares/authorizeRoles");
const router = express.Router();
const { SUPERUSER } = require("../constants/roles");

router.post("/", authenticate,  validateSubscribe, subscribe);
router.patch("/", authenticate, unsubscribe);
router.get("/notify", authenticate, authorizeRoles([SUPERUSER]), sendEmail);
module.exports = router;
