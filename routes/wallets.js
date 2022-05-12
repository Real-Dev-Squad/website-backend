const express = require("express");
const router = express.Router();
const wallet = require("../controllers/wallets");
const authenticate = require("../middlewares/authenticate");
const { authorizeUser } = require("../middlewares/authorization");

router.get("/", authenticate, wallet.getOwnWallet);

router.get("/:username", authenticate, authorizeUser("superUser"), wallet.getUserWallet);

module.exports = router;
