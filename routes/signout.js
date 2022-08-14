const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const cookie = "rds-session";
  res.clearCookie(cookie);
  res.end();
});

module.exports = router;
