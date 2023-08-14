const express = require("express");
const authenticate = require("../middlewares/authenticate");
const { validateUserRoles, validateRevokePrivileges } = require("../middlewares/validators/staging");
const { updateRoles, removePrivileges } = require("../controllers/staging");
const router = express.Router();

router.patch("/user", validateUserRoles, authenticate, updateRoles);
router.post("/users/privileges", validateRevokePrivileges, removePrivileges);

module.exports = router;
