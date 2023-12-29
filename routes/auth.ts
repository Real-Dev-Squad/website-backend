import express from "express";
const router = express.Router();
import auth from "../controllers/auth";
import authenticate from "../middlewares/authenticate";
import userDeviceInfoValidator from "../middlewares/validators/qrCodeAuth";
import qrCodeAuthValidator from "../middlewares/validators/qrCodeAuth";

router.get("/github/login", auth.githubAuthLogin);

router.get("/github/callback", auth.githubAuthCallback);

router.get("/signout", auth.signout);

router.get("/qr-code-auth", userDeviceInfoValidator.validateFetchingUserDocument, auth.fetchUserDeviceInfo);

router.get("/device", authenticate, auth.fetchDeviceDetails);

router.post("/qr-code-auth", userDeviceInfoValidator.storeUserDeviceInfo, auth.storeUserDeviceInfo);

router.patch(
  "/qr-code-auth/authorization_status/:authorization_status",
  authenticate,
  qrCodeAuthValidator.validateAuthStatus,
  auth.updateAuthStatus
);

module.exports = router;
