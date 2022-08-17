const signout = (req, res) => {
  const cookies = Object.keys(req.cookies);
  cookies.forEach((cookie) => {
    res.clearCookie(cookie);
  });
  return res.json({
    message: "Cookies deleted Succesfully",
    deletedCookies: Object.keys(req.cookies),
  });
};

module.exports = {
  signout,
};
