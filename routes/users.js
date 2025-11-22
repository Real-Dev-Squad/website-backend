const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const users = require("../controllers/users");
const { SUPERUSER } = require("../constants/roles");
const userValidator = require("../middlewares/validators/user");
const { upload } = require("../utils/multer");
const { getUserBadges } = require("../controllers/badges");
const checkIsVerifiedDiscord = require("../middlewares/verifydiscord");
const { authorizeAndAuthenticate } = require("../middlewares/authorizeUsersAndService");
const ROLES = require("../constants/roles");
const { Services } = require("../constants/bot");
const authenticateProfile = require("../middlewares/authenticateProfile");
const { devFlagMiddleware } = require("../middlewares/devFlag");
const { userAuthorization } = require("../middlewares/userAuthorization");
const conditionalMiddleware = require("../middlewares/conditionalMiddleware");

router.post("/", authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]), users.markUnverified);
router.post("/update-in-discord", authenticate, authorizeRoles([SUPERUSER]), users.setInDiscordScript);
router.post("/verify", authenticate, users.verifyUser);
router.get("/userId/:userId", users.getUserById);
router.patch("/self", authenticate, userValidator.updateUser, users.updateSelf); // this route is being deprecated soon, please use alternate available `/users/:userId?profile=true` PATCH endpoint.
router.get("/", authenticateProfile(authenticate), userValidator.getUsers, users.getUsers);
router.get("/self", authenticate, users.getSelfDetails);
router.get("/isDeveloper", authenticate, users.isDeveloper);
router.get("/isUsernameAvailable/:username", authenticate, users.getUsernameAvailabilty);
router.get("/username", authenticate, userValidator.validateGenerateUsernameQuery, users.generateUsername);
router.get("/chaincode", authenticate, users.generateChaincode);
router.get("/search", userValidator.validateUserQueryParams, users.filterUsers);
router.get("/identity-stats", authenticate, authorizeRoles([SUPERUSER]), users.getIdentityStats);
router.patch(
  "/:userId/update-nickname",
  authenticate,
  authorizeRoles([SUPERUSER]),
  checkIsVerifiedDiscord,
  users.updateDiscordUserNickname
);
router.get("/:username", users.getUser);
router.get("/:userId/intro", authenticate, authorizeRoles([SUPERUSER]), users.getUserIntro);
router.put("/self/intro", authenticate, userValidator.validateJoinData, users.addUserIntro); // This route is being deprecated soon, please use alternate available route `/users/:userId/intro`.
router.put(
  "/:userId/intro",
  devFlagMiddleware,
  authenticate,
  userValidator.validateJoinData,
  userAuthorization,
  users.addUserIntro
);
router.get("/:id/skills", users.getUserSkills);
router.get("/:id/badges", getUserBadges);
router.patch(
  "/",
  authenticate,
  authorizeRoles([SUPERUSER]),
  userValidator.validateUsersPatchHandler,
  users.usersPatchHandler
);
router.patch(
  "/:id/temporary/data",
  authenticate,
  authorizeRoles([SUPERUSER]),
  userValidator.validateUpdateRoles,
  users.updateRoles
);

// upload.single('profile') -> multer inmemory storage of file for type multipart/form-data
router.post("/picture", authenticate, checkIsVerifiedDiscord, upload.single("profile"), users.postUserPicture);
router.patch(
  "/picture/verify/:id",
  authenticate,
  authorizeRoles([SUPERUSER]),
  userValidator.validateImageVerificationQuery,
  users.verifyUserImage
);
router.get("/picture/:id", authenticate, authorizeRoles([SUPERUSER]), users.getUserImageForVerification);
router.patch("/profileURL", authenticate, userValidator.updateProfileURL, users.profileURL);
router.patch("/rejectDiff", authenticate, authorizeRoles([SUPERUSER]), users.rejectProfileDiff);
router.patch("/:userId", authenticate, conditionalMiddleware(userValidator.updateUser), users.updateProfile);
router.get("/suggestedUsers/:skillId", authenticate, authorizeRoles([SUPERUSER]), users.getSuggestedUsers);
router.post("/batch-username-update", authenticate, authorizeRoles([SUPERUSER]), users.updateUsernames);

module.exports = router;
