import { NextFunction, Request, Response } from "express"
import { REQUEST_TYPE } from "../constants/requests.js";
/**
* Middleware to selectively authenticate or verify Discord bot based on the request type.
* Specifically handles requests for onboarding extensions by skipping authentication.
*
* @param {Function} authenticate - The authentication middleware to apply for general requests.
* @param {Function} verifyDiscordBot - The middleware to verify requests from a Discord bot.
* @returns {Function} A middleware function that processes the request based on its type.
*
* @example
* app.use(skipAuthenticateForOnboardingExtensionRequest(authenticate, verifyDiscordBot));
*/
export const skipAuthenticateForOnboardingExtensionRequest = (authenticate, verifyDiscordBot) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const type = req.body.type;

        if(type === REQUEST_TYPE.ONBOARDING){
            return await verifyDiscordBot(req, res, next);
        }

        return await authenticate(req, res, next)
    }
}
