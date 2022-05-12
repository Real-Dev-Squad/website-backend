const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const users = require("../controllers/users");
const userValidator = require("../middlewares/validators/user");
const { upload } = require("../utils/multer");

router.patch("/self", authenticate, userValidator.updateUser, users.updateSelf);

router.get("/", authenticate, users.getUsers);

router.get("/self", authenticate, users.getSelfDetails);

router.get("/isUsernameAvailable/:username", authenticate, users.getUsernameAvailabilty);
router.post("/getUserById", users.getUserById);

router.get("/:username", users.getUser);

// upload.single('profile') -> multer inmemory storage of file for type multipart/form-data
router.post("/picture", authenticate, upload.single("profile"), users.postUserPicture);

router.patch("/identityURL", authenticate, userValidator.updateIdentityURL, users.identityURL);

module.exports = router;
