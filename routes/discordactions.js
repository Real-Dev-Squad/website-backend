const express = require("express");
const authenticate = require("../middlewares/authenticate");
const { createGroupRole, getAllGroupRoles } = require("../controllers/discordactions");
const { validateGroupRoleBody } = require("../middlewares/validators/discordactions");

const router = express.Router();

router.post("/create-role", authenticate, validateGroupRoleBody, createGroupRole);
router.get("/get-roles", authenticate, getAllGroupRoles);

module.exports = router;
