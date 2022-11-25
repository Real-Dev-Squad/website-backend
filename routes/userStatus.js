const express = require("express");
const { deleteUserStatus, getUserStatus, getAllUserStatus, updateUserStatus } = require("../controllers/userStatus");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
const { validateUpdatedUserStatus } = require("../middlewares/validators/userStatus");

router.get("/", getAllUserStatus);
router.get("/:userId", authenticate, getUserStatus);
router.patch("/:userId", authenticate, validateUpdatedUserStatus, updateUserStatus);
router.delete("/:userId", authenticate, authorizeRoles([SUPERUSER]), deleteUserStatus);

module.exports = router;
