const skipAuthorizeRolesUnderFF = (authorizeMiddleware) => {
  return (req, res, next) => {
    const { dev } = req.query;
    const isDev = dev === "true";
    if (isDev) {
      next();
    } else {
      authorizeMiddleware(req, res, next);
    }
  };
};

module.exports = skipAuthorizeRolesUnderFF;
