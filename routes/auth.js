const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth");
const signout = require("../controllers/signout");

router.get("/github/callback", auth.githubAuth);

router.get("/signout", signout.signout);

module.exports = router;
