const express = require("express");
const router = express.Router();
const events = require("../controllers/events");
const authenticate = require("../middlewares/authenticate");

router.post("/", authenticate, events.createEvent);
router.get("/", events.getAllEvents);
router.post("/join", events.joinEvent);
router.get("/:id", events.getEventById);
router.patch("/", authenticate, events.updateEvent);
router.patch("/end", authenticate, events.endActiveEvent);

module.exports = router;
