import express from "express"
import { addUserToGroupController } from "../controllers/awsAccess";
const router = express.Router();
const authorizeBot = require("../middlewares/authorizeBot");

router.post("/", authorizeBot.verifyDiscordBot, async (req, res) => {
    await addUserToGroupController(req, res);
});

module.exports = router;
