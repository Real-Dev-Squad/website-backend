import express from "express";
const router = express.Router();
import { githubAuthLogin, githubAuthCallback, googleAuthLogin, googleAuthCallback, signout, fetchUserDeviceInfo, storeUserDeviceInfo, fetchDeviceDetails, updateAuthStatus } from "../controllers/auth";
import authenticate from "../middlewares/authenticate";
import userDeviceInfoValidator from "../middlewares/validators/qrCodeAuth";
import qrCodeAuthValidator from "../middlewares/validators/qrCodeAuth";
import { devFlagMiddleware } from "../middlewares/devFlag";

router.get("/github/login", githubAuthLogin);

router.get("/github/callback", githubAuthCallback);

router.get("/google/login", devFlagMiddleware, googleAuthLogin);

router.get("/google/callback", googleAuthCallback);

router.get("/signout", signout);

router.get("/qr-code-auth", userDeviceInfoValidator.validateFetchingUserDocument, fetchUserDeviceInfo);

router.get("/device", authenticate, fetchDeviceDetails);

router.post("/qr-code-auth", userDeviceInfoValidator.storeUserDeviceInfo, storeUserDeviceInfo);

router.patch(
  "/qr-code-auth/authorization_status/:authorization_status",
  authenticate,
  qrCodeAuthValidator.validateAuthStatus,
  updateAuthStatus
);

export default router;
