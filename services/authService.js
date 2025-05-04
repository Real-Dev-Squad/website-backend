import jwt from "jsonwebtoken";
import config from "config";

/**
 * Generates the JWT
 *
 * @param payload {Object} - Payload to be added in the JWT
 * @return {String} - Generated JWT
 */
export const generateAuthToken = (payload) => {
  return jwt.sign(payload, config.get("userToken.privateKey"), {
    algorithm: "RS256",
    expiresIn: config.get("userToken.ttl"),
  });
};

/**
 * Verifies if the JWT is valid. Throws error in case of signature error or expiry
 *
 * @param token {String} - JWT to be verified
 * @return {Object} - Decode value of JWT
 */
export const verifyAuthToken = (token) => {
  return jwt.verify(token, config.get("userToken.publicKey"), { algorithms: ["RS256"] });
};

/**
 * Decodes the JWT. This is irrespective of the signature error or expiry
 *
 * @param token {String} - JWT to be decoded
 * @return {Object} - Decode value of JWT
 */
export const decodeAuthToken = (token) => {
  return jwt.decode(token);
};
