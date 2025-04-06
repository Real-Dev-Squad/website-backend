import botVerifcation from "../services/botVerificationService.js";
import { CLOUDFLARE_WORKER, CRON_JOB_HANDLER } from "../constants/bot.js";

export const verifyCronJob = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const data = botVerifcation.verifyCronJob(token);
    if (data.name !== CRON_JOB_HANDLER) {
      return res.boom.unauthorized("Cron job not verified");
    }

    return next();
  } catch (error) {
    return res.boom.badRequest("Unauthorized Cron Worker");
  }
};

export const verifyDiscordBot = async (req, res, next) => {
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
