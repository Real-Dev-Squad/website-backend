import { NextFunction } from "express";
import { CustomRequest, CustomResponse } from "../types/global";

export const devFlagMiddleware = (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  try {
    const dev = req.query.dev === "true";
    if (!dev) {
      return res.boom.notFound("Route not found");
    }
    next();
  } catch (err) {
    logger.error("Error occurred in devFlagMiddleware:", err.message);
    next(err);
  }
};
