const express = require("express");
const router = express.Router();

router.post("/", (req, res) => {
  res.clearCookie("rds-session");
  res.redirect("/healthcheck");
});

module.exports = router;
