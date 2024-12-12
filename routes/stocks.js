const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { addNewStock, fetchStocks, getSelfStocks } = require("../controllers/stocks");
const { createStock } = require("../middlewares/validators/stocks");
const { SUPERUSER } = require("../constants/roles");
const { devFlagMiddleware } = require("../middlewares/devFlag");
const { userAuthorization } = require("../middlewares/userAuthorization");

router.get("/", fetchStocks);
router.post("/", authenticate, authorizeRoles([SUPERUSER]), createStock, addNewStock);
router.get("/user/self", authenticate, getSelfStocks); // this route will soon be deprecated, please use `/stocks/:userId` route.
router.get("/:userId", devFlagMiddleware, authenticate, userAuthorization, getUserStocks);

module.exports = router;
