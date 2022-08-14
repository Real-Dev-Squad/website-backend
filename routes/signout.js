const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const cookie = req.cookies;
  res.clearCookie(cookie);
});

module.exports = router;
