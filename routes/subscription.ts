import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
import { subscribe, unsubscribe, sendEmail } from "../controllers/subscription";

router.post('/', authenticate, subscribe);
router.put('/', authenticate, unsubscribe)
router.get('/send-email', sendEmail)
module.exports = router;