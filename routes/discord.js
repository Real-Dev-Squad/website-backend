const express = require("express");
const router = express.Router();
const authorizeBot = require("../middlewares/authorizeBot");
const validator = require("../middlewares/validators/discord");
const discord = require("../controllers/discord");

router.post("/", validator.discordData, authorizeBot, discord.addDiscordData);

module.exports = router;
