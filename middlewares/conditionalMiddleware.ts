const conditionalMiddleware = (validator) => {
  return async (req, res, next) => {
    if (req.params.userId === req.userData.id && req.query.profile === "true") {
      console.log("Profile middleware");
      return validator(req, res, next);
    }
    next();
  };
};

module.exports = conditionalMiddleware;
