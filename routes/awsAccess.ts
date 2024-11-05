import express from "express"
import { addUserToGroupController } from "../controllers/awsAccess";
const router = express.Router();
const { verifyDiscordBot } = require("../middlewares/authorizeBot");

router.post("", addUserToGroupController);

module.exports = router;