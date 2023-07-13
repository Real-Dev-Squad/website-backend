const express = require("express");
const passport = require("passport");
const router = express.Router();
const auth = require("../controllers/auth");
const authenticate = require("../middlewares/authenticate");
const userDeviceInfoValidator = require("../middlewares/validators/qrCodeAuth");
const qrCodeAuthValidator = require("../middlewares/validators/qrCodeAuth");

router.get("/github/login", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/callback", auth.githubAuth);

router.get("/signout", auth.signout);

router.post("/qr-code-auth", userDeviceInfoValidator.storeUserDeviceInfo, auth.storeUserDeviceInfo);
router.patch(
  "/qr-code-auth/authorization_status/:authorization_status",
  authenticate,
  qrCodeAuthValidator.validateAuthStatus,
  auth.updateAuthStatus
);

module.exports = router;
