import express from "express";
import wallet from "../controllers/wallets.js";
import authenticate from "../middlewares/authenticate.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { SUPERUSER } from "../constants/roles.js";

const router = express.Router();

router.get("/", authenticate, wallet.getOwnWallet);
router.get("/:username", authenticate, authorizeRoles([SUPERUSER]), wallet.getUserWallet);

export default router;
