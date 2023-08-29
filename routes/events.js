const express = require("express");
const router = express.Router();
const events = require("../controllers/events");
const authenticate = require("../middlewares/authenticate");
const eventsValidator = require("../middlewares/validators/events");

router.post("/", authenticate, eventsValidator.createEvent, events.createEvent);
router.get("/", eventsValidator.getAllEvents, events.getAllEvents);
router.post("/join", eventsValidator.joinEvent, events.joinEvent);
router.get("/:id", eventsValidator.getEventById, events.getEventById);
router.patch("/", authenticate, eventsValidator.updateEvent, events.updateEvent);
router.patch("/end", authenticate, eventsValidator.endActiveEvent, events.endActiveEvent);
router.post("/:id/peers", authenticate, eventsValidator.addPeerToEvent, events.addPeerToEvent);
router.patch("/:id/peers/kickout", authenticate, eventsValidator.kickoutPeer, events.kickoutPeer);

module.exports = router;
