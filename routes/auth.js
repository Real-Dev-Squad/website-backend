const express = require("express");
const passport = require("passport");
const router = express.Router();
const auth = require("../controllers/auth");
const userDeviceInfoValidator = require("../middlewares/validators/userDeviceInfo");

router.get("/github/login", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/callback", auth.githubAuth);

router.get("/signout", auth.signout);

router.post("/qr-code-auth", userDeviceInfoValidator.storeUserDeviceInfo, auth.storeUserDeviceInfo);

module.exports = router;
