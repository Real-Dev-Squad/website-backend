import express from "express";
import authorizeBot from "../middlewares/authorizeBot.js";
import validator from "../middlewares/validators/external-accounts.js";
import externalAccount from "../controllers/external-accounts.js";
import authenticate from "../middlewares/authenticate.js";
import authorizeRoles from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";
import { Services } from "../constants/bot.js";
import { authorizeAndAuthenticate } from "../middlewares/authorizeUsersAndService.js";

const router = express.Router();

router.post("/", validator.externalAccountData, authorizeBot.verifyDiscordBot, externalAccount.addExternalAccountData);
router.get("/:token", authenticate, externalAccount.getExternalAccountData);
router.patch("/link/:token", authenticate, validator.linkDiscord, externalAccount.linkExternalAccount);
router.patch("/discord-sync", authenticate, authorizeRoles([ROLES.SUPERUSER]), externalAccount.syncExternalAccountData);
router.post(
  "/users",
  authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]),
  validator.postExternalAccountsUsers,
  externalAccount.externalAccountsUsersPostHandler
);

export default router;
