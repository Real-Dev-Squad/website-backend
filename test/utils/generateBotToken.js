import jwt from "jsonwebtoken";
import config from "config";

/**
 * Generates the JWT
 *
 * @param payload {Object} - Payload to be added in the JWT
 * @return {String} - Generated JWT
 */
export const generateToken = (data) => {
  return jwt.sign(data, config.get("botToken.botPrivateKey"), {
    algorithm: "RS256",
    expiresIn: "1m",
  });
};

/**
 * Generates the JWT
 *
 * @param payload {Object} - Payload to be added in the JWT
 * @return {String} - Generated JWT
 */
const generateDiscordServiceToken = (data) => {
  return jwt.sign(data, config.get("discordService.privateKey"), {
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

export default { generateToken, generateCronJobToken, generateDiscordServiceToken };
