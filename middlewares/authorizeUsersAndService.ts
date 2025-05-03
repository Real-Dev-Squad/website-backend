import jwt, { JwtPayload } from "jsonwebtoken";
import { NextFunction } from "express";
import { verifyCronJob, verifyDiscordBot } from "./authorizeBot.js";
import { CustomRequest, CustomResponse } from "../types/global.js";
import authenticate from "./authenticate.js";
import { authorizeRoles } from "./authorizeRoles.js";
import logger from "../utils/logger.js";
import { Services } from "../constants/bot.js";
import { ROLES } from "../constants/roles.js";
import { INTERNAL_SERVER_ERROR_MESSAGE } from "../constants/progresses.js";

export const authorizeAndAuthenticate = (allowedRoles: string[], allowedServices: string[]) => {
  const isRolesValid = allowedRoles.every((role) => Object.values(ROLES).includes(role));
  if (!isRolesValid) {
    throw new Error("Invalid role");
  }
  const isServicesValid = allowedServices.every((service) => Object.values(Services).includes(service));
  if (!isServicesValid) {
    throw new Error("Invalid service name");
  }

  return async (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
    try {
      if (req.headers.authorization) {
        const authParts = req.headers.authorization.split(" ");
        const authToken = authParts[1];
        if (authParts.length !== 2 || authParts[0] !== "Bearer" || !authToken) {
          return res.boom.unauthorized("Invalid Authentication header format. Expected 'Bearer <token>'");
        }
        const payload: JwtPayload | null = jwt.decode(authToken, { json: true });

        if (!payload) {
          return res.boom.unauthorized("Invalid Authentication token.");
        }
        switch (payload.name) {
          case Services.CRON_JOB_HANDLER: {
            return await verifyCronJob(req, res, next);
          }
          case Services.CLOUDFLARE_WORKER: {
            return await verifyDiscordBot(req, res, next);
          }
          default: {
            return res.boom.unauthorized("Unauthorized service");
          }
        }
      } else {
        let isNextCalled = false;
        const customNext = () => {
          isNextCalled = true;
        };
        const response = await authenticate(req, res, customNext);
        if (!isNextCalled) {
          return response;
        }
        const authorizeRolesMiddleware = authorizeRoles(allowedRoles);
        return authorizeRolesMiddleware(req, res, next);
      }
    } catch (err) {
      logger.error(`Error authenticating: ${err}`);
      return res.boom.badImplementation(INTERNAL_SERVER_ERROR_MESSAGE);
    }
  };
};
