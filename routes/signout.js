const express = require("express");
const router = express.Router();
const signout = require("../controllers/signout");

router.get("/", signout.signout);

module.exports = router;
