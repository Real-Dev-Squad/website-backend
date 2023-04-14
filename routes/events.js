const express = require("express");
const router = express.Router();
const events = require("../controllers/events");
const authenticate = require("../middlewares/authenticate");

router.post("/", authenticate, events.createRoom);
router.get("/", events.getAllRooms);
router.post("/join", events.joinRoom);
router.get("/:id", events.getRoomById);
router.put("/", authenticate, events.updateRoom);
router.delete("/", authenticate, events.endActiveRoom);

module.exports = router;
