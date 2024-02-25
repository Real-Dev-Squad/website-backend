const express = require("express");
const router = express.Router();
const authorizeBot = require("../middlewares/authorizeBot");
const validator = require("../middlewares/validators/external-accounts");
const externalAccount = require("../controllers/external-accounts");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
const ROLES = require("../constants/roles");
const { Services } = require("../constants/bot");
const { authorization } = require("../middlewares/authorizeUsersAndService");

router.post("/", validator.externalAccountData, authorizeBot.verifyDiscordBot, externalAccount.addExternalAccountData);
router.get("/:token", authenticate, externalAccount.getExternalAccountData);
router.patch("/discord-sync", authenticate, authorizeRoles([SUPERUSER]), externalAccount.syncExternalAccountData);
router.post(
  "/users",
  authorization([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]),
  validator.postExternalAccountsUsers,
  externalAccount.externalAccountsUsersPostHandler
);

module.exports = router;
