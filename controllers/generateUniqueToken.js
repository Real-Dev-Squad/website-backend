const uuid = require("uuid");

/**
 * Route used to generate a unique token
 *
 * @param req {Object} - Express request object
 * @param res {Object} - Express response object
 */
const generateToken = (req, res) => {
  const token = uuid.v4();
  res.send({ token });
};

module.exports = {
  generateToken,
};
