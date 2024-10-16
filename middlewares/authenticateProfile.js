const authenticateProfile = (authenticate) => {
  return async (req, res, next) => {
    if (req.query.profile === "true") {
      return await authenticate(req, res, next);
    }
    return next();
  };
};

module.exports = authenticateProfile;
