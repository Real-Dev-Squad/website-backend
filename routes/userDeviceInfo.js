const express = require("express");
const { storeUserDeviceInfo } = require("../controllers/userDeviceInfo");

const router = express.Router();

router.post("/", storeUserDeviceInfo);

module.exports = router;
