const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth");
const authenticate = require("../middlewares/authenticate");
const userDeviceInfoValidator = require("../middlewares/validators/qrCodeAuth");
const qrCodeAuthValidator = require("../middlewares/validators/qrCodeAuth");

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
