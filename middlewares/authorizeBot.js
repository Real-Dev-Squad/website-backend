const botVerifcation = require("../services/botVerificationService");
const { CLOUDFLARE_WORKER } = require("../constants/bot");

module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const data = botVerifcation.verifyToken(token);

    if (data.name !== CLOUDFLARE_WORKER) {
      return res.boom.unauthorized("Unauthorized Bot");
    }

    return next();
  } catch (error) {
    if (error.message === "invalid token") {
      return res.boom.unauthorized("Unauthorized Bot");
    }
    return res.boom.badRequest("Invalid Request");
  }
};
