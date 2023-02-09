const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const users = require("../controllers/users");
const { SUPERUSER } = require("../constants/roles");
const userValidator = require("../middlewares/validators/user");
const { upload } = require("../utils/multer");
const { getUserBadges } = require("../controllers/badges");

router.post("/verify", authenticate, users.verifyUser);
router.get("/userId/:userId", users.getUserById);
router.patch("/self", authenticate, userValidator.updateUser, users.updateSelf);
router.get("/", authenticate, userValidator.getUsers, users.getUsers);
router.get("/self", authenticate, users.getSelfDetails);
router.get("/isUsernameAvailable/:username", authenticate, users.getUsernameAvailabilty);
router.get("/chaincode", authenticate, users.generateChaincode);
router.get("/:username", users.getUser);
router.get("/:userId/intro", authenticate, authorizeRoles([SUPERUSER]), users.getUserIntro);
router.put("/self/intro", authenticate, userValidator.validateJoinData, users.addUserIntro);
router.get("/:id/skills", users.getUserSkills);
router.get("/:id/badges", getUserBadges);

// upload.single('profile') -> multer inmemory storage of file for type multipart/form-data
router.post("/picture", authenticate, upload.single("profile"), users.postUserPicture);
router.patch("/profileURL", authenticate, userValidator.updateProfileURL, users.profileURL);
router.patch("/rejectDiff", authenticate, authorizeRoles([SUPERUSER]), users.rejectProfileDiff);
router.patch("/:userId", authenticate, authorizeRoles([SUPERUSER]), users.updateUser);
router.get("/suggestedUsers/:skillId", authenticate, authorizeRoles([SUPERUSER]), users.getSuggestedUsers);

module.exports = router;
