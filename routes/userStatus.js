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
const { validateUserStatus, validatePartialUserStatus } = require("../middlewares/validators/userStatus");

router.get("/", getAllUserStatus);
router.get("/:userId", authenticate, getUserStatus);
router.post("/:userId", authenticate, validateUserStatus, addUserStatus);
router.delete("/:userId", authenticate, deleteUserStatus);
router.patch("/:userId", authenticate, validatePartialUserStatus, validateUserStatus, updateUserStatus);

module.exports = router;
