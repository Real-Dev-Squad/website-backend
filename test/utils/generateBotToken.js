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

const generateCronJobToken = (data) => {
  const token = jwt.sign(data, config.get("cronJobHandler.privateKey"), {
    algorithm: "RS256",
    expiresIn: "1m",
  });
  return token;
};

module.exports = { generateToken, generateCronJobToken };
