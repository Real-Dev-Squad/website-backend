import express from "express";
import authenticate from "../middlewares/authenticate.js";
import { subscribe, unsubscribe, sendEmail } from "../controllers/subscription.js";
import { validateSubscribe } from "../middlewares/validators/subscription.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";

const router = express.Router();
const { SUPERUSER } = ROLES;
router.post("/", authenticate, validateSubscribe, subscribe);
router.patch("/", authenticate, unsubscribe);
router.get("/notify", authenticate, authorizeRoles([SUPERUSER]), sendEmail);
export default router;
