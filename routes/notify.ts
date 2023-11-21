const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const { notifyController } = require("../controllers/notify");
const { notifyValidator } = require("../middlewares/validators/notify");

router.post("/", notifyValidator, authenticate, notifyController);
module.exports = router;
