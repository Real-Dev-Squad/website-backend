const skipAuthorizeRolesUnderFF = (authorizeMiddleware) => {
  return (req, res, next) => {
    const { dev } = req.query;
    const isDev = dev ? Boolean(dev) : false;
    if (isDev) {
      next();
    } else {
      authorizeMiddleware(req, res, next);
    }
  };
};

module.exports = skipAuthorizeRolesUnderFF;
