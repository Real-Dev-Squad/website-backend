import { NextFunction, Request, Response } from "express";
import { CustomRequest, CustomResponse } from "../types/global";  // Assuming these types extend the default ones

export const devFlagMiddleware = (req: CustomRequest, res: CustomResponse, next: NextFunction) => {
  try {
    const dev = req.query.dev === "true";
    if (!dev) {
      return res.boom.notFound("Route not found");
    }
    next();
  } catch (err) {
    next(err);
  }
};
