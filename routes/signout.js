const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.clearCookie("rds-session");
    res.redirect("/healthcheck");
});

module.exports = router;
