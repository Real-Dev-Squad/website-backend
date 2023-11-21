const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const { fcmTokenController } = require("../controllers/fcmToken");
const { fcmTokenValidator } = require("../middlewares/validators/fcmToken");

// the route should be authenticated
router.post("/", fcmTokenValidator, authenticate, fcmTokenController);
module.exports = router;
