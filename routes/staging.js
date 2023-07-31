const express = require("express");
const authenticate = require("../middlewares/authenticate");
const { validateUserRoles } = require("../middlewares/validators/staging");
const { updateRoles } = require("../controllers/staging");
const router = express.Router();

router.patch("/user", validateUserRoles, authenticate, updateRoles);

module.exports = router;
