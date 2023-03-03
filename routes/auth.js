const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth");

router.get("/github/login", auth.githubAuthLogin);

router.get("/github/callback", auth.githubAuthCallback);

router.get("/signout", auth.signout);

module.exports = router;
