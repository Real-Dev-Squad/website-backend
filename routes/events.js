import express from "express";
import authenticate from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import { ROLES } from "../constants/roles.js";
import events from "../controllers/events.js";
import eventsValidator from "../middlewares/validators/events.js";

const router = express.Router();

router.post("/", authenticate, eventsValidator.createEvent, events.createEvent);
router.get("/", eventsValidator.getAllEvents, events.getAllEvents);
router.post(
  "/join-admin",
  authenticate,
  authorizeRoles([ROLES.SUPERUSER, ROLES.MEMBER]),
  eventsValidator.joinEvent,
  events.joinEvent
);
router.post("/join", eventsValidator.joinEvent, events.joinEvent);
router.get("/:id", eventsValidator.getEventById, events.getEventById);
router.patch("/", authenticate, eventsValidator.updateEvent, events.updateEvent);
router.patch(
  "/end",
  authenticate,
  authorizeRoles([ROLES.SUPERUSER, ROLES.MEMBER]),
  eventsValidator.endActiveEvent,
  events.endActiveEvent
);
router.post("/:id/peers", eventsValidator.addPeerToEvent, events.addPeerToEvent);
router.patch(
  "/:id/peers/kickout",
  authenticate,
  authorizeRoles([ROLES.SUPERUSER, ROLES.MEMBER]),
  eventsValidator.kickoutPeer,
  events.kickoutPeer
);
router.post(
  "/:id/codes",
  authenticate,
  authorizeRoles([ROLES.SUPERUSER]),
  eventsValidator.generateEventCode,
  events.generateEventCode
);
router.get(
  "/:id/codes",
  authenticate,
  authorizeRoles([ROLES.SUPERUSER]),
  eventsValidator.getEventCodes,
  events.getEventCodes
);
export default router;
