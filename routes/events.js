const express = require("express");
const router = express.Router();
const events = require("../controllers/events");
const authenticate = require("../middlewares/authenticate");
const eventsValidator = require("../middlewares/validators/events");
const authorizeEventRoles = require("../middlewares/authorizeEventRoles");
const { ROLES } = require("../constants/events");

router.post("/", authenticate, authorizeEventRoles([ROLES.HOST]), eventsValidator.createEvent, events.createEvent);

router.get(
  "/",
  authenticate,
  authorizeEventRoles([ROLES.HOST, ROLES.MODERATOR]),
  eventsValidator.getAllEvents,
  events.getAllEvents
);

router.post(
  "/join-admin",
  authenticate,
  authorizeEventRoles([ROLES.HOST, ROLES.MODERATOR]),
  eventsValidator.joinEvent,
  events.joinEvent
);

router.post("/join", authorizeEventRoles([ROLES.MAVEN, ROLES.GUEST]), eventsValidator.joinEvent, events.joinEvent);

router.get("/:id", eventsValidator.getEventById, events.getEventById);

router.patch("/", authenticate, authorizeEventRoles([ROLES.HOST]), eventsValidator.updateEvent, events.updateEvent);

router.patch(
  "/end",
  authenticate,
  authorizeEventRoles([ROLES.HOST]),
  eventsValidator.endActiveEvent,
  events.endActiveEvent
);

module.exports = router;
