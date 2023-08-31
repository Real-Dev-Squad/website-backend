const express = require("express");
const router = express.Router();
const events = require("../controllers/events");
const authenticate = require("../middlewares/authenticate");
const eventsValidator = require("../middlewares/validators/events");
const { SUPERUSER, MEMBER } = require("../constants/roles");
const authorizeRoles = require("../middlewares/authorizeRoles");

router.post("/", authenticate, eventsValidator.createEvent, events.createEvent);
router.get("/", eventsValidator.getAllEvents, events.getAllEvents);
router.post(
  "/join-admin",
  authenticate,
  authorizeRoles([SUPERUSER, MEMBER]),
  eventsValidator.joinEvent,
  events.joinEvent
);
router.post("/join", eventsValidator.joinEvent, events.joinEvent);
router.get("/:id", eventsValidator.getEventById, events.getEventById);
router.patch("/", authenticate, eventsValidator.updateEvent, events.updateEvent);
router.patch(
  "/end",
  authenticate,
  authorizeRoles([SUPERUSER, MEMBER]),
  eventsValidator.endActiveEvent,
  events.endActiveEvent
);
router.post("/:id/peers", eventsValidator.addPeerToEvent, events.addPeerToEvent);
router.patch(
  "/:id/peers/kickout",
  authenticate,
  authorizeRoles([SUPERUSER, MEMBER]),
  eventsValidator.kickoutPeer,
  events.kickoutPeer
);
router.post(
  "/:id/codes",
  authenticate,
  authorizeRoles([SUPERUSER]),
  eventsValidator.generateEventCode,
  events.generateEventCode
);
router.get(
  "/:id/codes",
  authenticate,
  authorizeRoles([SUPERUSER, MEMBER]),
  eventsValidator.getEventCodes,
  events.getEventCodes
);
module.exports = router;
