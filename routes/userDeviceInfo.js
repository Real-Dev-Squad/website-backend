const express = require("express");
const userDeviceInfo = require("../controllers/userDeviceInfo");
const userDeviveInfoValidator = require("../middlewares/validators/userDeviceInfo");

const router = express.Router();

router.post("/", userDeviveInfoValidator.storeUserDeviceInfo, userDeviceInfo.storeUserDeviceInfo);

module.exports = router;
