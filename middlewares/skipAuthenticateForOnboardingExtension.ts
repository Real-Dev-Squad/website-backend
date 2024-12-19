import { NextFunction, Request, Response } from "express"
import { REQUEST_TYPE } from "../constants/requests";

export const skipAuthenticateForOnboardingExtensionRequest = (authenticate, verifyDiscordBot) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const type = req.body.type;
        const dev = req.query.dev;

        if(type === REQUEST_TYPE.ONBOARDING){
            if (dev != "true"){
                return res.status(501).json({
                    message: "Feature not implemented"
                })
            }
            return await verifyDiscordBot(req, res, next);
        }

        return await authenticate(req, res, next)
    }
}