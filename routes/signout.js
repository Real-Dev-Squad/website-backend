const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.clearCookie("rds-session-development");
  res.redirect("/healthcheck");
});

module.exports = router;
