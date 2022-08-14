const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const cookie = req.cookies;
  res.clearCookie(cookie);
  res.redirect("/healthcheck");
});

module.exports = router;
