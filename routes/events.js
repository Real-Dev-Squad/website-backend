const express = require("express");
const router = express.Router();
const events = require("../controllers/events");
const authenticate = require("../middlewares/authenticate");
const eventsValidator = require("../middlewares/validators/events");
const authorizeEventRoles = require("../middlewares/authorizeEventRoles");
const { ROLES } = require("../constants/events");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");

router.post("/", authenticate, authorizeRoles([SUPERUSER]), eventsValidator.createEvent, events.createEvent);

router.get("/", authenticate, eventsValidator.getAllEvents, events.getAllEvents);

router.post(
  "/join-admin",
  authenticate,
  authorizeEventRoles([ROLES.HOST, ROLES.MODERATOR]),
  eventsValidator.joinEvent,
  events.joinEvent
);

router.post("/join", authorizeEventRoles([ROLES.MAVEN, ROLES.GUEST]), eventsValidator.joinEvent, events.joinEvent);

router.get("/:id", eventsValidator.getEventById, events.getEventById);

router.patch("/", authenticate, authorizeRoles([SUPERUSER]), eventsValidator.updateEvent, events.updateEvent);

router.patch("/end", authenticate, authorizeRoles([SUPERUSER]), eventsValidator.endActiveEvent, events.endActiveEvent);
router.post("/:id/peers", authenticate, eventsValidator.addPeerToEvent, events.addPeerToEvent);

router.patch(
  "/:id/peers/kickout",
  authenticate,
  authorizeRoles([SUPERUSER]),
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
router.get("/:id/codes", authenticate, eventsValidator.getEventCodes, events.getEventCodes);
module.exports = router;
