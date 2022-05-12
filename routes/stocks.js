const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { authorizeUser } = require("../middlewares/authorization");
const { addNewStock, fetchStocks, getSelfStocks } = require("../controllers/stocks");
const { createStock } = require("../middlewares/validators/stocks");

router.get("/", fetchStocks);

router.post("/", authenticate, authorizeUser("superUser"), createStock, addNewStock);

router.get("/user/self", authenticate, getSelfStocks);

module.exports = router;
