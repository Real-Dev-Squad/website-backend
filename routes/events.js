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

module.exports = router;
