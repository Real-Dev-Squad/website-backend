const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  const cookies = Object.keys(req.cookies);
  cookies.forEach((cookie) => {
    res.clearCookie(cookie);
  });
  return res.json({
    message: "Cookies deleted Succesfully",
    deletedCookies: cookies,
  });
});

module.exports = router;
