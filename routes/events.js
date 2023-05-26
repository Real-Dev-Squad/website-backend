const express = require("express");
const router = express.Router();
const events = require("../controllers/events");
// const authenticate = require("../middlewares/authenticate");
const eventsValidator = require("../middlewares/validators/events");

router.post("/", eventsValidator.createEvent, events.createEvent);
router.get("/", eventsValidator.getAllEvents, events.getAllEvents);
router.post("/join", eventsValidator.joinEvent, events.joinEvent);
router.get("/:id", eventsValidator.getEventById, events.getEventById);
router.patch("/", eventsValidator.updateEvent, events.updateEvent);
router.patch("/end", eventsValidator.endActiveEvent, events.endActiveEvent);

module.exports = router;
