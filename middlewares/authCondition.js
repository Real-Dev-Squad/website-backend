const authenticate = require("./authenticate");

const authCondition = async (req, res, next) => {
  if (req.query.profile === "true") {
    return authenticate(req, res, next);
  }
  return next();
};

module.exports = authCondition;
