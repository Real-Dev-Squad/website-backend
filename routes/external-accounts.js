const express = require("express");
const router = express.Router();
const authorizeBot = require("../middlewares/authorizeBot");
const validator = require("../middlewares/validators/external-accounts");
const extAccount = require("../controllers/external-accounts");

router.post("/", validator.externalAccountData, authorizeBot, extAccount.addExternalAccountData);

module.exports = router;
