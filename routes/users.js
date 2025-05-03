import express from "express";
import authenticate from "../middlewares/authenticate.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import users from "../controllers/users.js";
import { ROLES } from "../constants/roles.js";
import {
  updateUser,
  getUsers,
  validateGenerateUsernameQuery,
  validateUserQueryParams,
  validateJoinData,
  validateUsersPatchHandler,
  validateUpdateRoles,
  validateImageVerificationQuery,
  updateProfileURL,
} from "../middlewares/validators/user.js";
import { upload } from "../utils/multer.js";
import { getUserBadges } from "../controllers/badges.js";
import checkIsVerifiedDiscord from "../middlewares/verifydiscord.js";
import { authorizeAndAuthenticate } from "../middlewares/authorizeUsersAndService.js";
import { Services } from "../constants/bot.js";
import authenticateProfile from "../middlewares/authenticateProfile.js";
import { devFlagMiddleware } from "../middlewares/devFlag.js";
import { userAuthorization } from "../middlewares/userAuthorization.js";
import conditionalMiddleware from "../middlewares/conditionalMiddleware.js";

const router = express.Router();
const { SUPERUSER } = ROLES;

router.post("/", authorizeAndAuthenticate([ROLES.SUPERUSER], [Services.CRON_JOB_HANDLER]), users.markUnverified);
router.post("/update-in-discord", authenticate, authorizeRoles([SUPERUSER]), users.setInDiscordScript);
router.post("/verify", authenticate, users.verifyUser);
router.get("/userId/:userId", users.getUserById);
router.patch("/self", authenticate, updateUser, users.updateSelf); // this route is being deprecated soon, please use alternate available `/users/:userId?profile=true` PATCH endpoint.
router.get("/", authenticateProfile(authenticate), getUsers, users.getUsers);
router.get("/self", authenticate, users.getSelfDetails);
router.get("/isDeveloper", authenticate, users.isDeveloper);
router.get("/isUsernameAvailable/:username", authenticate, users.getUsernameAvailabilty);
router.get("/username", authenticate, validateGenerateUsernameQuery, users.generateUsername);
router.get("/chaincode", authenticate, users.generateChaincode);
router.get("/search", validateUserQueryParams, users.filterUsers);
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
router.put("/self/intro", authenticate, validateJoinData, users.addUserIntro); // This route is being deprecated soon, please use alternate available route `/users/:userId/intro`.
router.put("/:userId/intro", devFlagMiddleware, authenticate, validateJoinData, userAuthorization, users.addUserIntro);
router.get("/:id/skills", users.getUserSkills);
router.get("/:id/badges", getUserBadges);
router.patch("/", authenticate, authorizeRoles([SUPERUSER]), validateUsersPatchHandler, users.usersPatchHandler);
router.patch("/:id/temporary/data", authenticate, authorizeRoles([SUPERUSER]), validateUpdateRoles, users.updateRoles);

// upload.single('profile') -> multer inmemory storage of file for type multipart/form-data
router.post("/picture", authenticate, checkIsVerifiedDiscord, upload.single("profile"), users.postUserPicture);
router.patch(
  "/picture/verify/:id",
  authenticate,
  authorizeRoles([SUPERUSER]),
  validateImageVerificationQuery,
  users.verifyUserImage
);
router.get("/picture/:id", authenticate, authorizeRoles([SUPERUSER]), users.getUserImageForVerification);
router.patch("/profileURL", authenticate, updateProfileURL, users.profileURL);
router.patch("/rejectDiff", authenticate, authorizeRoles([SUPERUSER]), users.rejectProfileDiff);
router.patch("/:userId", authenticate, conditionalMiddleware(updateUser), users.updateProfile);
router.get("/suggestedUsers/:skillId", authenticate, authorizeRoles([SUPERUSER]), users.getSuggestedUsers);
router.post("/batch-username-update", authenticate, authorizeRoles([SUPERUSER]), users.updateUsernames);

export default router;
