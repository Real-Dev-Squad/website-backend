const express = require("express");
const authenticate = require("../middlewares/authenticate");
const { createGroupRole, getAllGroupRoles } = require("../controllers/discordactions");

const router = express.Router();

router.post("/create-role", authenticate, createGroupRole);
router.get("/get-roles", authenticate, getAllGroupRoles);

module.exports = router;
