const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { addNewStock, fetchStocks, getSelfStocks } = require("../controllers/stocks");
const { createStock } = require("../middlewares/validators/stocks");
const { SUPERUSER } = require("../constants/roles");

router.get("/", fetchStocks);
router.post("/", authenticate, authorizeRoles([SUPERUSER]), createStock, addNewStock);
router.get("/user/self", authenticate, getSelfStocks);

module.exports = router;
