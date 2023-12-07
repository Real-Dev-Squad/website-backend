const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const { fcmTokenController } = require("../controllers/fcmToken");
const { fcmTokenValidator } = require("../middlewares/validators/fcmToken");

router.post("/", authenticate, fcmTokenValidator, fcmTokenController);
module.exports = router;
