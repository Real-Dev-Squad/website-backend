import express from "express"
import { addUserToAWSGroup } from "../controllers/awsAccess.js";
const router = express.Router();
import { verifyDiscordBot } from "../middlewares/authorizeBot.js";

router.post("/access", verifyDiscordBot, addUserToAWSGroup);

export default  router;
