const express = require("express");
const { SUPERUSER } = require("../constants/roles");
const events = require("../controllers/events");
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const router = express.Router();

router.get("/", authenticate, authorizeRoles([SUPERUSER]), events.getAllEvents);
router.get("/tasks", authenticate, authorizeRoles([SUPERUSER]), events.getAllTaskEvents);
router.get("/users", authenticate, authorizeRoles([SUPERUSER]), events.getAllUserEvents);
router.get("/:username", authenticate, authorizeRoles([SUPERUSER]), events.getUserEvents);
router.post("/", authenticate, events.addNewEvent);

module.exports = router;
