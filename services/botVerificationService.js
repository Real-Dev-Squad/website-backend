const jwt = require("jsonwebtoken");

/**
 * Verifies if the JWT is valid. Throws error in case of signature error or expiry
 *
 * @param token {String} - JWT to be verified
 * @return {Object} - Decode value of JWT
 */
const verifyToken = (token) => {
  return jwt.verify(token, config.get("botToken.publicKey"), { algorithms: ["RS256"] });
};

module.exports = { verifyToken };
