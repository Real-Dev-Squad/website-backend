const express = require("express");
const router = express.Router();
const authorizeBot = require("../middlewares/authorizeBot");
const validator = require("../middlewares/validators/external-accounts");
const externalAccount = require("../controllers/external-accounts");
const authenticate = require("../middlewares/authenticate");

router.post("/", validator.externalAccountData, authorizeBot, externalAccount.addExternalAccountData);
router.get("/:token", authenticate, externalAccount.getExternalAccountData);

module.exports = router;
