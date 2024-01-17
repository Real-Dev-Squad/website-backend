import express from "express";
const router = express.Router();
import { createInviteValidator } from "../middlewares/validators/invites";
import { createInviteLink,getInviteLink } from "../controllers/invites";

router.post("/", createInviteValidator, createInviteLink);
router.get("/:uniqueUserId" , getInviteLink);

module.exports = router;