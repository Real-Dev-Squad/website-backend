import express from "express";
const router = express.Router();
import authenticate from "../middlewares/authenticate";
import { subscribe, unsubscribe } from "../controllers/subscription";

router.post('/', authenticate, subscribe);
router.put('/', authenticate, unsubscribe)
module.exports = router;