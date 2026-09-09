const express = require("express");
const router = express.Router();
const authenticate = require("../middlewares/authenticate");
const authorizeRoles = require("../middlewares/authorizeRoles");
const users = require("../controllers/users");
const { SUPERUSER } = require("../constants/roles");
const userValidator = require("../middlewares/validators/user");
const { upload } = require("../utils/multer");
const { cacheResponse, invalidateCache, CACHE_TTL_24H_MIN } = require("../utils/cache");
const { ALL_USERS } = require("../constants/cacheKeys");
const { getUserBadges } = require("../controllers/badges");
const checkIsVerifiedDiscord = require("../middlewares/verifydiscord");
const { authorizeAndAuthenticate } = require("../middlewares/authorizeUsersAndService");
const ROLES = require("../constants/roles");
const { Services } = require("../constants/bot");
const authenticateProfile = require("../middlewares/authenticateProfile");
const { devFlagMiddleware } = require("../middlewares/devFlag");
const { userAuthorization } = require("../middlewares/userAuthorization");
const conditionalMiddleware = require("../middlewares/conditionalMiddleware");
const skipWhenApplicationType = require("../middlewares/pictureRouteMiddleware");

router.post("/", authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]), users.markUnverified);
router.post(
  "/update-in-discord",
  authenticate,
  authorizeRoles([SUPERUSER]),
  invalidateCache({ invalidationKeys: [ALL_USERS] }),
  users.setInDiscordScript,
);
router.post("/verify", authenticate, invalidateCache({ invalidationKeys: [ALL_USERS] }), users.verifyUser);
router.get(
  "/userId/:userId",
  cacheResponse({ invalidationKey: ALL_USERS, expiry: CACHE_TTL_24H_MIN }),
  users.getUserById,
);
router.patch(
  "/self",
  authenticate,
  invalidateCache({ invalidationKeys: [ALL_USERS] }),
  userValidator.updateUser,
  users.updateSelf,
); // this route is being deprecated soon, please use alternate available `/users/:userId?profile=true` PATCH endpoint.
router.get("/", authenticateProfile(authenticate), userValidator.getUsers, users.getUsers);
router.get("/self", authenticate, users.getSelfDetails);
router.get("/isDeveloper", authenticate, users.isDeveloper);
router.get("/isUsernameAvailable/:username", authenticate, users.getUsernameAvailabilty);
router.get("/username", authenticate, userValidator.validateGenerateUsernameQuery, users.generateUsername);
router.get("/chaincode", authenticate, invalidateCache({ invalidationKeys: [ALL_USERS] }), users.generateChaincode);
// TODO: Have a discussion, if this '/search' needs to be open or protected.
// For now making it protected and super_user only to sort the high firestore read issues, for usersStatus collection
router.get(
  "/search",
  authenticate,
  authorizeRoles([SUPERUSER]),
  userValidator.validateUserQueryParams,
  users.filterUsers,
);
router.get("/identity-stats", authenticate, authorizeRoles([SUPERUSER]), users.getIdentityStats);
router.patch(
  "/:userId/update-nickname",
  authenticate,
  authorizeRoles([SUPERUSER]),
  checkIsVerifiedDiscord,
  users.updateDiscordUserNickname,
);
router.get("/:username", cacheResponse({ invalidationKey: ALL_USERS, expiry: CACHE_TTL_24H_MIN }), users.getUser);
router.get("/:userId/intro", authenticate, authorizeRoles([SUPERUSER]), users.getUserIntro);
router.put(
  "/self/intro",
  authenticate,
  invalidateCache({ invalidationKeys: [ALL_USERS] }),
  userValidator.validateJoinData,
  users.addUserIntro,
); // This route is being deprecated soon, please use alternate available route `/users/:userId/intro`.
router.put(
  "/:userId/intro",
  devFlagMiddleware,
  authenticate,
  invalidateCache({ invalidationKeys: [ALL_USERS] }),
  userValidator.validateJoinData,
  userAuthorization,
  users.addUserIntro,
);
router.get("/:id/skills", users.getUserSkills);
router.get("/:id/badges", getUserBadges);
router.patch(
  "/",
  authenticate,
  authorizeRoles([SUPERUSER]),
  invalidateCache({ invalidationKeys: [ALL_USERS] }),
  userValidator.validateUsersPatchHandler,
  users.usersPatchHandler,
);
router.patch(
  "/:id/temporary/data",
  authenticate,
  authorizeRoles([SUPERUSER]),
  invalidateCache({ invalidationKeys: [ALL_USERS] }),
  userValidator.validateUpdateRoles,
  users.updateRoles,
);

// upload.single('profile') -> multer inmemory storage of file for type multipart/form-data
router.post(
  "/picture",
  authenticate,
  invalidateCache({ invalidationKeys: [ALL_USERS] }),
  upload.single("profile"),
  skipWhenApplicationType(checkIsVerifiedDiscord),
  users.handleUserPictureUpload,
);
router.patch(
  "/picture/verify/:id",
  authenticate,
  authorizeRoles([SUPERUSER]),
  userValidator.validateImageVerificationQuery,
  users.verifyUserImage,
);
router.get("/picture/:id", authenticate, authorizeRoles([SUPERUSER]), users.getUserImageForVerification);
router.patch(
  "/profileURL",
  authenticate,
  invalidateCache({ invalidationKeys: [ALL_USERS] }),
  userValidator.updateProfileURL,
  users.profileURL,
);
router.patch("/rejectDiff", authenticate, authorizeRoles([SUPERUSER]), users.rejectProfileDiff);
router.patch(
  "/:userId",
  authenticate,
  invalidateCache({ invalidationKeys: [ALL_USERS] }),
  conditionalMiddleware(userValidator.updateUser),
  users.updateProfile,
);
router.get("/suggestedUsers/:skillId", authenticate, authorizeRoles([SUPERUSER]), users.getSuggestedUsers);
router.post(
  "/batch-username-update",
  authenticate,
  authorizeRoles([SUPERUSER]),
  invalidateCache({ invalidationKeys: [ALL_USERS] }),
  users.updateUsernames,
);

module.exports = router;
