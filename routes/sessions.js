const express = require("express");
const router = express.Router();
const sessions = require("../controllers/sessions");
const authenticate = require("../middlewares/authenticate");

router.get("/", authenticate, sessions.getAllSessions);
router.get("/:id", authenticate, sessions.getSessionById);

module.exports = router;
