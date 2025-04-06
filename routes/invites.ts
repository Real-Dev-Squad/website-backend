import express from "express";
const router = express.Router();
import { createInviteValidator } from "../middlewares/validators/invites";
import { createInviteLink,getInviteLink } from "../controllers/invites";
import authinticateServiceRequest from "../middlewares/authinticateServiceRequest";

router.post("/",authinticateServiceRequest, createInviteValidator, createInviteLink);
router.get("/:userId" ,authinticateServiceRequest, getInviteLink);

export default  router;