const express = require("express");
const {
  deleteUserStatus,
  getUserStatus,
  getAllUserStatus,
  updateUserStatus,
  updateAllUserStatus,
  cancelOOOStatus,
} = require("../controllers/userStatus");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { SUPERUSER } = require("../constants/roles");
const { validateUserStatus } = require("../middlewares/validators/userStatus");

router.get("/", getAllUserStatus);
router.get("/self", authenticate, getUserStatus);
router.get("/:userId", getUserStatus);
router.patch("/self", authenticate, validateUserStatus, (req, res, next) => {
  if (Object.keys(req.body).includes("cancelOoo")) {
    cancelOOOStatus(req, res, next);
  } else {
    updateUserStatus(req, res, next);
  }
});
router.patch("/update", authenticate, authorizeRoles([SUPERUSER]), updateAllUserStatus);
router.patch("/:userId", authenticate, authorizeRoles([SUPERUSER]), validateUserStatus, updateUserStatus);
router.delete("/:userId", authenticate, authorizeRoles([SUPERUSER]), deleteUserStatus);

module.exports = router;
