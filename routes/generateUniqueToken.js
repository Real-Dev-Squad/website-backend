const express = require("express");
const router = express.Router();
const token = require("../controllers/generateUniqueToken");

router.get("/", token.generateToken);

module.exports = router;
