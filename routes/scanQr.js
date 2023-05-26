const express = require("express");
const { isQrScanned } = require("../controllers/scanQr");

const router = express.Router();

router.get("/:user_id", isQrScanned);

module.exports = router;
