const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const { fcmTokenController } = require("../controllers/fcmToken");

router.post("/", authenticate, fcmTokenController);
module.exports = router;
