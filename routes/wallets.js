const express = require("express");
const router = express.Router();
const wallet = require("../controllers/wallets");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");

router.get("/", authenticate, wallet.getOwnWallet);
router.get("/:username", authenticate, authorizeRoles([SUPERUSER]), wallet.getUserWallet);

module.exports = router;
