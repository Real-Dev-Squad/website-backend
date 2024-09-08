import express from "express";
import authenticate from "../middlewares/authenticate";
import { subscribe, unsubscribe, sendEmail } from "../controllers/subscription";
import { validateSubscribe } from "../middlewares/validators/subscription";
import authorizeRoles from "../middlewares/authorizeRoles";
const router = express.Router();
const { SUPERUSER } = require("../constants/roles");

router.post("/", authenticate, validateSubscribe, subscribe);
router.put("/", authenticate, unsubscribe);
router.get("/send-email", authenticate, authorizeRoles([SUPERUSER]), sendEmail);
module.exports = router;
