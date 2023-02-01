const jwt = require("jsonwebtoken");

/**
 * Generates the JWT
 *
 * @param payload {Object} - Payload to be added in the JWT
 * @return {String} - Generated JWT
 */
const generateToken = (data) => {
  return jwt.sign(data, config.get("botToken.botPrivateKey"), {
    algorithm: "RS256",
    expiresIn: "1m",
  });
};

module.exports = { generateToken };
