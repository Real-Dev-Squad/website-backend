const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const { authorizeUser } = require("../middlewares/authorization");
const users = require("../controllers/users");
const {
  LEGACY_ROLES: { SUPER_USER },
} = require("../constants/roles");
const userValidator = require("../middlewares/validators/user");
const { upload } = require("../utils/multer");

router.post("/verify", authenticate, users.verifyUser);
router.get("/userId/:userId", users.getUserById);
router.patch("/self", authenticate, userValidator.updateUser, users.updateSelf);
router.get("/", authenticate, users.getUsers);
router.get("/self", authenticate, users.getSelfDetails);
router.get("/isUsernameAvailable/:username", authenticate, users.getUsernameAvailabilty);
router.get("/chaincode", authenticate, users.generateChaincode);
router.get("/:username", users.getUser);
// upload.single('profile') -> multer inmemory storage of file for type multipart/form-data
router.post("/picture", authenticate, upload.single("profile"), users.postUserPicture);
router.patch("/profileURL", authenticate, userValidator.updateProfileURL, users.profileURL);
router.patch("/rejectDiff", authenticate, authorizeUser(SUPER_USER), users.rejectProfileDiff);
router.patch("/:userId", authenticate, authorizeUser(SUPER_USER), users.updateUser);

module.exports = router;
