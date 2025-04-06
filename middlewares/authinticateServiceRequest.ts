import { verifyAuthToken } from "../utils/verifyAuthToken";
import { CustomResponse } from "../types/global";
import { NextFunction } from "express";
import { InviteBodyRequest } from "../types/invites";
import logger from "../utils/logger.js";

const authinticateServiceRequest = async (req: InviteBodyRequest, res: CustomResponse, next: NextFunction) => {
  try {
    const authHeader = req.headers?.authorization;
    if (!authHeader) {
      return res.boom.unauthorized();
    }
    if (!authHeader.startsWith("Bearer ")) {
      return res.boom.unauthorized();
    }
    const token = authHeader.split(" ")[1];
    const isValid = await verifyAuthToken(token);
    if (!isValid) {
      return res.boom.unauthorized();
    }
    next();
  } catch (error) {
    logger.error("Internal server error", error);
    return res.boom.internal(error);
  }
};

export default authinticateServiceRequest;
