const express = require("express");
const authenticate = require("../middlewares/authenticate");
const { createRole } = require("../controllers/discordactions");

const router = express.Router();

router.post("/create/role", authenticate, createRole);
router.get("/get/roles", authenticate, () => {});

module.exports = router;
