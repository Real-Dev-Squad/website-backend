const jwt = require("jsonwebtoken");
/**
 * Generates the JWT
 *
 * @param payload {Object} - Payload to be added in the JWT
 * @return {String} - Generated JWT
 */
const generateAuthToken = (payload) => {
  return jwt.sign(payload, config.get("userToken.privateKey"), {
    algorithm: "RS256",
    expiresIn: config.get("userToken.ttl"),
  });
};

/**
 * Generates a short-lived JWT token for impersonation sessions.
 *
 * @param {Object} payload - The payload to include in the JWT (e.g., userId, impersonatedUserId).
 * @param {string} payload.userId - The ID of the super-user initiating the impersonation.
 * @param {string} payload.impersonatedUserId - The ID of the user being impersonated.
 * @returns {string} - The generated JWT for impersonation, signed using RS256 algorithm.
 */
const generateImpersonationAuthToken = (payload) => {
  return jwt.sign(payload, config.get("userToken.privateKey"), {
    algorithm: "RS256",
    expiresIn: config.get("userToken.impersonationTtl"),
  });
};

/**
 * Verifies if the JWT is valid. Throws error in case of signature error or expiry
 *
 * @param token {String} - JWT to be verified
 * @return {Object} - Decode value of JWT
 */
const verifyAuthToken = (token) => {
  return jwt.verify(token, config.get("userToken.publicKey"), { algorithms: ["RS256"] });
};

/**
 * Decodes the JWT. This is irrespective of the signature error or expiry
 *
 * @param token {String} - JWT to be decoded
 * @return {Object} - Decode value of JWT
 */
const decodeAuthToken = (token) => {
  return jwt.decode(token);
};

module.exports = {
  generateAuthToken,
  verifyAuthToken,
  decodeAuthToken,
  generateImpersonationAuthToken,
};
