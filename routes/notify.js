const express = require("express");
const router = express.Router();

const authenticate = require("../middlewares/authenticate");
const { notifyController } = require("../controllers/notify");

router.post("/", authenticate, notifyController);
module.exports = router;
