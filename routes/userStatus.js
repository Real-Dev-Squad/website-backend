const express = require("express");
const {
  addUserStatus,
  deleteUserStatus,
  getUserStatus,
  getAllUserStatus,
  updateUserStatus,
} = require("../controllers/userStatus");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
const { validateUserStatus, validateUpdatedUserStatus } = require("../middlewares/validators/userStatus");

router.post("/:userId", authenticate, validateUserStatus, addUserStatus);
router.get("/", getAllUserStatus);
router.get("/:userId", authenticate, getUserStatus);
router.patch("/:userId", authenticate, validateUpdatedUserStatus, updateUserStatus);
router.delete("/:userId", authenticate, authorizeRoles([SUPERUSER]), deleteUserStatus);

module.exports = router;
