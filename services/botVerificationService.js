const jwt = require("jsonwebtoken");
const { CLOUDFLARE_WORKER } = require("../constants/bot");

/**
 * Generates the JWT
 *
 * @param payload {Object} - Payload to be added in the JWT
 * @return {String} - Generated JWT
 */
const generateToken = () => {
  return jwt.sign({ name: CLOUDFLARE_WORKER }, config.get("botToken.privateKey"), {
    algorithm: "RS256",
  });
};

/**
 * Verifies if the JWT is valid. Throws error in case of signature error or expiry
 *
 * @param token {String} - JWT to be verified
 * @return {Object} - Decode value of JWT
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.get("botToken.publicKey"), { algorithms: ["RS256"] });
};

module.exports = { generateToken, verifyToken };
