const express = require("express");
const router = express.Router();
const auth = require("../controllers/auth");

router.get("/github/callback", auth.githubAuth);

module.exports = router;
