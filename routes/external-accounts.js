const express = require("express");
const router = express.Router();
const authorizeBot = require("../middlewares/authorizeBot");
const validator = require("../middlewares/validators/external-accounts");
const externalAccount = require("../controllers/external-accounts");

router.post("/", validator.externalAccountData, authorizeBot, externalAccount.addExternalAccountData);

module.exports = router;
