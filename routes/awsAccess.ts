import express from "express"
import { addUserToAWSGroup } from "../controllers/awsAccess";
const router = express.Router();
const { verifyDiscordBot } = require("../middlewares/authorizeBot");

router.post("", verifyDiscordBot, addUserToAWSGroup);

module.exports = router;