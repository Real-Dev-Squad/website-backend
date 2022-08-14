const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const cookies = Object.keys(req.cookies);
  cookies.forEach((cookie) => {
    res.clearCookie(cookie);
  });
  res.end();
});

module.exports = router;
