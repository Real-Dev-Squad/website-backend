const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { trade } = require("../controllers/trading");
const { newTrade } = require("../middlewares/validators/trading");

router.post("/stock/new/self", authenticate, newTrade, trade);

module.exports = router;
