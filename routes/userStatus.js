const express = require("express");
const {
  deleteUserStatus,
  getUserStatus,
  getAllUserStatus,
  updateUserStatus,
  updateAllUserStatus,
  massUpdateIdleUsers,
} = require("../controllers/userStatus");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
const { validateUserStatus, validateMassUpdate } = require("../middlewares/validators/userStatus");

router.get("/", getAllUserStatus);
router.get("/self", authenticate, getUserStatus);
router.get("/:userId", getUserStatus);
router.patch("/batch", authenticate, authorizeRoles([SUPERUSER]), validateMassUpdate, massUpdateIdleUsers);
router.patch("/self", authenticate, validateUserStatus, updateUserStatus);
router.patch("/update", authenticate, authorizeRoles([SUPERUSER]), updateAllUserStatus);
router.patch("/batch", authenticate, authorizeRoles([SUPERUSER]), validateMassUpdate, massUpdateIdleUsers);
router.patch("/:userId", authenticate, authorizeRoles([SUPERUSER]), validateUserStatus, updateUserStatus);
router.delete("/:userId", authenticate, authorizeRoles([SUPERUSER]), deleteUserStatus);

module.exports = router;
