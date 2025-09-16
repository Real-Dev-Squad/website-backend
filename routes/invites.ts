import express from "express";
import { createInviteValidator } from "../middlewares/validators/invites.js";
import { createInviteLink,getInviteLink } from "../controllers/invites.js";
import authinticateServiceRequest from "../middlewares/authinticateServiceRequest.js";

const router = express.Router();

router.post("/",authinticateServiceRequest, createInviteValidator, createInviteLink);
router.get("/:userId" ,authinticateServiceRequest, getInviteLink);

export default  router;
