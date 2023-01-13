const express = require("express");
const {
  deleteUserStatus,
  getUserStatus,
  getAllUserStatus,
  updateUserStatus,
  updateAllUserStatus,
} = require("../controllers/userStatus");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
const { validateUpdatedUserStatus } = require("../middlewares/validators/userStatus");

router.get("/", getAllUserStatus);
router.get("/self", authenticate, getUserStatus);
router.get("/:userId", getUserStatus);
router.patch("/self", authenticate, validateUpdatedUserStatus, updateUserStatus);
router.patch("/update", authenticate, authorizeRoles([SUPERUSER]), updateAllUserStatus);
router.patch("/:userId", authenticate, authorizeRoles([SUPERUSER]), validateUpdatedUserStatus, updateUserStatus);
router.delete("/:userId", authenticate, authorizeRoles([SUPERUSER]), deleteUserStatus);

module.exports = router;
